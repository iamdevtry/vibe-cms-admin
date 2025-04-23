## Run MongoDB locally
1. Run `docker compose up -d` or `docker compose up` to start the container
2. Wait for the container to start
3. Run `npx prisma db push`
4. Run `yarn seed`

## Issues caused by running MongoDB locally
### Summary Document: MongoDB Replica Set Initialization Issue and Solutions

#### Overview
In the `vibe-cms` project, a MongoDB instance running in Docker (via `docker-compose`) failed to initialize a replica set (`rs0`), causing errors that prevented Prisma from connecting and executing commands like `npx prisma db push` and `yarn seed`. The primary issues were:
- **MongoDB Errors**: `MongoServerError[NotYetInitialized]: no replset config has been received` when running `rs.status()`, and earlier errors like `BadValue: security.keyFile is required` and `invalid char in key file`.
- **Prisma Error**: `Server selection timeout: None of the available servers suitable for criteria ReadPreference(Primary). Topology: { Type: ReplicaSetNoPrimary, Set Name: rs0, Servers: [ { Address: localhost:27017, Type: RsGhost } ] }`.
These errors stemmed from the replica set not being initialized, leaving the MongoDB node in an `RsGhost` state without a `PRIMARY` node, which Prisma requires for transactions.

The setup uses:
- MongoDB 7.0 (`mongo:7.0`) in Docker Compose.
- Authentication (`monty:pass`).
- A `keyFile` for internal authentication (`--keyFile /etc/mongo-keyfile`).
- No persistent volumes (ephemeral data).
- A `healthcheck` intended to initialize the replica set, which was failing.

This document summarizes the root causes of the replica set initialization issue and the steps to resolve it, ensuring MongoDB runs as a single-node replica set and Prisma operations succeed.

#### Root Causes of the Replica Set Issue
1. **Uninitialized Replica Set**:
   - The `rs.initiate` command was not executed successfully, leaving the replica set unconfigured (`NotYetInitialized`).
   - MongoDB started with `--replSet rs0` but required `rs.initiate` to define the replica set members.

2. **Healthcheck Failure**:
   - The `healthcheck` in `docker-compose.yml` failed to run `rs.initiate` due to:
     - **Timing Issues**: MongoDB wasn’t fully started or authenticated when the `healthcheck` executed.
     - **Hostname Issues**: `localhost:27017` or `mongo:27017` didn’t resolve correctly during initialization.
     - **Authentication Issues**: Problems with `monty:pass` or the `keyFile` prevented `rs.initiate`.
     - **Syntax/Execution**: The `healthcheck` command was malformed or interrupted.

3. **Authentication and KeyFile Issues**:
   - Authentication (`MONGO_INITDB_ROOT_USERNAME=monty`, `MONGO_INITDB_ROOT_PASSWORD=pass`) and `--replSet` required a `keyFile` for internal authentication.
   - Early errors included:
     - `BadValue: security.keyFile is required`: No `keyFile` was initially provided.
     - `invalid char in key file`: A manual `keyFile` (`my-secure-key-1234567890`) was invalid.
   - These issues disrupted MongoDB startup and replica set initialization.

4. **Network/Hostname Resolution**:
   - The `healthcheck` used `localhost:27017` or `mongo:27017`, which failed to resolve in the Docker container’s context during early startup, preventing `rs.initiate` from succeeding.

5. **Ephemeral Data (No Volumes)**:
   - Skipping persistent volumes (`mongo-data:/data/db`, `mongo-config:/data/configdb`) meant the replica set configuration was not retained across `docker-compose down`.
   - The `healthcheck` had to initialize the replica set on every container start, and its failure led to the persistent `NotYetInitialized` state.

6. **MongoDB Startup Delays**:
   - MongoDB’s startup process (loading `keyFile`, setting up authentication) delayed readiness, causing the `healthcheck` to run prematurely and fail.

#### Solutions to Resolve the Replica Set Issue
The following steps address the root causes, ensuring the MongoDB replica set is initialized, a `PRIMARY` node is available, and Prisma operations (`npx prisma db push`, `yarn seed`) succeed.

1. **Manually Initialize the Replica Set**:
   - **Purpose**: Confirm `rs.initiate` works and diagnose issues.
   - **Steps**:
     - Connect to MongoDB:
       ```bash
       docker exec -it mongo mongosh -u monty -p pass --authenticationDatabase admin
       ```
     - Run `rs.initiate`:
       ```javascript
       rs.initiate({
         _id: "rs0",
         members: [{ _id: 0, host: "localhost:27017" }]
       })
       ```
     - Verify with `rs.status()`:
       - Expect `"name": "rs0"`, `members` with `name: "localhost:27017"`, and `"stateStr": "PRIMARY"`.
     - If `mongo:27017` or `host.docker.internal:27017` is needed, adjust the host accordingly.
   - **Outcome**: Establishes a `PRIMARY` node, resolving `NotYetInitialized` and `RsGhost`.

2. **Update `docker-compose.yml` Healthcheck**:
   - **Purpose**: Ensure automatic replica set initialization on container start.
   - **Updated `docker-compose.yml`**:
     ```yaml
     version: '3.8'
     services:
       mongo:
         image: mongo:7.0
         container_name: mongo
         ports:
           - "27017:27017"
         environment:
           - MONGO_INITDB_ROOT_USERNAME=monty
           - MONGO_INITDB_ROOT_PASSWORD=pass
           - MONGO_INITDB_DATABASE=vibe-cms
         volumes:
           - ./mongo-keyfile:/etc/mongo-keyfile:ro
         command: ["--replSet", "rs0", "--bind_ip_all", "--keyFile", "/etc/mongo-keyfile"]
         healthcheck:
           test: |
             mongosh -u monty -p pass --authenticationDatabase admin --port 27017 --quiet --eval "
               var status = rs.status();
               if (status.ok !== 1 && !status.hasOwnProperty('myState')) {
                 rs.initiate({
                   _id: 'rs0',
                   members: [{ _id: 0, host: 'localhost:27017' }]
                 });
               }
             "
           interval: 5s
           timeout: 60s
           retries: 30
           start_period: 30s
           start_interval: 2s
     ```
   - **Changes**:
     - Robust `healthcheck` script checks `rs.status()` and only runs `rs.initiate` if uninitialized.
     - Uses `localhost:27017` (worked in manual initialization).
     - Increased `start_period` to `30s` to ensure MongoDB is ready.
     - `timeout: 60s` allows time for `rs.initiate`.
   - **Verification**:
     - Restart: `docker-compose down && docker-compose up -d`.
     - Check logs: `docker logs mongo` for `rs.initiate` success.
     - Check health: `docker inspect --format "{{json .State.Health }}" mongo` (expect `"Status": "healthy"`).

3. **Ensure Valid `keyFile`**:
   - **Purpose**: Fix earlier `invalid char in key file` and ensure internal authentication.
   - **Steps**:
     - Recreate `keyFile`:
       ```bash
       openssl rand -base64 756 > mongo-keyfile
       chmod 600 mongo-keyfile
       ```
     - Verify permissions: `ls -l mongo-keyfile` (expect `-rw-------`).
     - Ensure `mongo-keyfile` is in the same directory as `docker-compose.yml`.
     - Check container: `docker exec -it mongo ls -l /etc/mongo-keyfile` (expect `-r--------`).
   - **Outcome**: Resolves `BadValue: security.keyFile` and authentication issues.

4. **Test and Verify MongoDB**:
   - **Steps**:
     - Connect: `docker exec -it mongo mongosh -u monty -p pass --authenticationDatabase admin`.
     - Run `rs.status()` to confirm `PRIMARY` state.
     - Test connection: `mongosh "mongodb://monty:pass@localhost:27017/vibe-cms?authSource=admin&replicaSet=rs0"`.
   - **Outcome**: Confirms replica set is initialized and accessible.

5. **Run Prisma Commands**:
   - **Steps**:
     - Ensure `.env`:
       ```env
       DATABASE_URL="mongodb://monty:pass@localhost:27017/vibe-cms?authSource=admin&retryWrites=true&w=majority&replicaSet=rs0"
       ```
     - Sync schema: `npx prisma db push`.
     - Run seed: `yarn seed` (requires `tsx`: `yarn add --dev tsx`).
   - **Outcome**: Resolves `Server selection timeout`, allowing Prisma operations.

6. **Handle Ephemeral Data**:
   - **Context**: No persistent volumes (per your request).
   - **Steps**:
     - After `docker-compose down`, run `npx prisma db push` and `yarn seed` post `docker-compose up -d`.
     - The `healthcheck` ensures replica set initialization.
   - **Outcome**: Manages ephemeral data while maintaining functionality.

#### Troubleshooting Tips
If issues persist:
- **Healthcheck Failure**:
  - Test manually: `docker exec -it mongo mongosh -u monty -p pass --authenticationDatabase admin --quiet --eval "var status = rs.status(); if (status.ok !== 1 && !status.hasOwnProperty('myState')) { rs.initiate({ _id: 'rs0', members: [{ _id: 0, host: 'localhost:27017' }] }); }"`
  - Increase `start_period` to `60s` or `timeout` to `120s`.
- **Authentication/KeyFile**:
  - Verify credentials and `keyFile` permissions.
  - Recreate `keyFile` if needed.
- **Hostname**:
  - Try `mongo:27017` or `host.docker.internal:27017` in `healthcheck` and `DATABASE_URL`.
- **Logs**:
  - Check `docker logs mongo` for `rs.initiate`, `keyFile`, or authentication errors.
- **Prisma**:
  - Share `npx prisma db push` or `yarn seed` errors.
  - Verify `schema.prisma` and `prisma/seed.ts`.

#### Final Setup
**`mongo-keyfile`**:
```bash
openssl rand -base64 756 > mongo-keyfile
chmod 600 mongo-keyfile
```

**`docker-compose.yml`**:
```yaml
version: '3.8'
services:
  mongo:
    image: mongo:7.0
    container_name: mongo
    ports:
      - "27017:27017"
    environment:
      - MONGO_INITDB_ROOT_USERNAME=monty
      - MONGO_INITDB_ROOT_PASSWORD=pass
      - MONGO_INITDB_DATABASE=vibe-cms
    volumes:
      - ./mongo-keyfile:/etc/mongo-keyfile:ro
    command: ["--replSet", "rs0", "--bind_ip_all", "--keyFile", "/etc/mongo-keyfile"]
    healthcheck:
      test: |
        mongosh -u monty -p pass --authenticationDatabase admin --port 27017 --quiet --eval "
          var status = rs.status();
          if (status.ok !== 1 && !status.hasOwnProperty('myState')) {
            rs.initiate({
              _id: 'rs0',
              members: [{ _id: 0, host: 'localhost:27017' }]
            });
          }
        "
      interval: 5s
      timeout: 60s
      retries: 30
      start_period: 30s
      start_interval: 2s
```

**`.env`**:
```env
DATABASE_URL="mongodb://monty:pass@localhost:27017/vibe-cms?authSource=admin&retryWrites=true&w=majority&replicaSet=rs0"
```

**Run**:
```bash
docker-compose down
docker-compose up -d
npx prisma db push
yarn seed
```

#### Expected Outcome
- MongoDB initializes the replica set (`rs0`) with a `PRIMARY` node (`localhost:27017`).
- `rs.status()` shows a valid configuration, resolving `NotYetInitialized`.
- Prisma connects, resolving `Server selection timeout`.
- `npx prisma db push` and `yarn seed` succeed, setting up the `vibe-cms` database.

#### Additional Considerations
- **MongoDB Atlas**: For a managed replica set, consider MongoDB Atlas to avoid local setup issues.
- **Persistent Volumes**: Re-add volumes (`mongo-data:/data/db`, `mongo-config:/data/configdb`) for data retention across restarts.
- **Documentation**:
  - Prisma: https://www.prisma.io/docs/orm/overview/databases/mongodb
  - MongoDB: https://www.mongodb.com/docs/manual/reference/method/rs.initiate/

This solution ensures your MongoDB replica set is reliably initialized, enabling Prisma to function correctly in your `vibe-cms` project.

