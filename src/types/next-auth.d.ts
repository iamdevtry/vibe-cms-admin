import { UserStatus } from "@prisma/client";
import NextAuth, { DefaultSession } from "next-auth";
import { JWT } from "next-auth/jwt";

declare module "next-auth" {
  /**
   * Extend the built-in session types
   */
  interface Session {
    user: {
      id: string;
      role?: string | null;
      permissions?: string[] | null;
      status?: string | null;
    } & DefaultSession["user"];
  }

  /**
   * Extend the built-in user types
   */
  interface User {
    id: string;
    username?: string | null;
    firstName?: string | null;
    lastName?: string | null;
    displayName?: string | null;
    avatar?: string | null;
    role?: string | null;
    permissions?: string[] | null;
    status?: UserStatus | null;
  }
}

declare module "next-auth/jwt" {
  /**
   * Extend the built-in JWT types
   */
  interface JWT {
    id: string;
    role?: string | null;
    permissions?: string[] | null;
    status?: string | null;
  }
}
