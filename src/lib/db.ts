/**
 * Prisma client singleton module
 * 
 * This module provides a single instance of PrismaClient to be used across the application.
 * Following the Singleton pattern to prevent multiple instances of PrismaClient in development.
 */

import { PrismaClient } from '@prisma/client';

// Prevent multiple instances of Prisma Client in development
const globalForPrisma = global as unknown as { prisma: PrismaClient };

// Initialize Prisma Client as a singleton
export const db = globalForPrisma.prisma || new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

// Set the globally scoped variable in development
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = db;
}