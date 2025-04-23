#!/bin/bash

# Script to test the user profile API endpoints
# Note: This script requires jq to be installed for JSON processing

echo "Testing User Profile Management API Endpoints"
echo "============================================="

# Define the base URL for the API
BASE_URL="http://localhost:3000/api"
COOKIE_FILE="cookie.txt"

# Step 1: Login to get session cookie
echo -e "\n1. Logging in to get session cookie..."
curl -s -c $COOKIE_FILE -X POST "$BASE_URL/auth/callback/credentials" \
  -H "Content-Type: application/json" \
  -d '{"email":"me@devtry.net", "password":"password", "redirect":false, "csrfToken":"test"}' \
  > /dev/null

if [ $? -ne 0 ]; then
  echo "Error: Login failed"
  exit 1
fi

# Step 2: Get user profile
echo -e "\n2. Getting user profile..."
PROFILE_RESPONSE=$(curl -s -b $COOKIE_FILE "$BASE_URL/users/profile")
echo "$PROFILE_RESPONSE" | jq .

# Step 3: Update user profile
echo -e "\n3. Updating user profile..."
# Create a temporary file with form data
TMP_FORM=$(mktemp)

# Create a multipart form with curl
cat > $TMP_FORM << EOF
--boundary
Content-Disposition: form-data; name="firstName"

John
--boundary
Content-Disposition: form-data; name="lastName"

Doe
--boundary
Content-Disposition: form-data; name="username"

johndoe
--boundary
Content-Disposition: form-data; name="email"

me@devtry.net
--boundary
Content-Disposition: form-data; name="bio"

This is my updated bio from the API test script.
--boundary--
EOF

# Send the update request
UPDATE_RESPONSE=$(curl -s -b $COOKIE_FILE -X PUT "$BASE_URL/users/profile" \
  -H "Content-Type: multipart/form-data; boundary=boundary" \
  -T $TMP_FORM)

echo "$UPDATE_RESPONSE" | jq .

# Clean up temporary file
rm $TMP_FORM

# Step 4: Test password change
echo -e "\n4. Testing password change..."
PASS_RESPONSE=$(curl -s -b $COOKIE_FILE -X POST "$BASE_URL/users/change-password" \
  -H "Content-Type: application/json" \
  -d '{"currentPassword":"password", "newPassword":"NewPassword123"}')

echo "$PASS_RESPONSE" | jq .

# Clean up cookie file
rm $COOKIE_FILE

echo -e "\nTests completed!"
