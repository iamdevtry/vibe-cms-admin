/**
 * Validation utilities for user data
 *
 * This module contains utilities for validating user input data
 * following the Single Responsibility Principle by centralizing validation logic.
 */

import { z } from 'zod';

/**
 * User profile validation schema
 */
export const userProfileSchema = z.object({
  username: z
    .string()
    .min(3, { message: "Username must be at least 3 characters long" })
    .max(30, { message: "Username must be at most 30 characters long" })
    .regex(/^[a-zA-Z0-9_.-]+$/, { message: "Username can only contain letters, numbers, and _.-" }),
  email: z
    .string()
    .email({ message: "Invalid email address" }),
  firstName: z
    .string()
    .max(50, { message: "First name must be at most 50 characters long" })
    .optional(),
  lastName: z
    .string()
    .max(50, { message: "Last name must be at most 50 characters long" })
    .optional(),
  bio: z
    .string()
    .max(500, { message: "Bio must be at most 500 characters long" })
    .optional(),
});

/**
 * Password validation schema
 */
export const passwordSchema = z
  .string()
  .min(8, { message: "Password must be at least 8 characters long" })
  .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter" })
  .regex(/[a-z]/, { message: "Password must contain at least one lowercase letter" })
  .regex(/[0-9]/, { message: "Password must contain at least one number" });

/**
 * Password change validation schema
 */
export const passwordChangeSchema = z.object({
  currentPassword: z.string().min(1, { message: "Current password is required" }),
  newPassword: passwordSchema,
  confirmPassword: z.string().min(1, { message: "Password confirmation is required" }),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

/**
 * Validate a user profile against the schema
 * 
 * @param data - User profile data to validate
 * @returns Validation result with success flag and errors if any
 */
export function validateUserProfile(data: unknown) {
  const result = userProfileSchema.safeParse(data);
  
  if (!result.success) {
    return {
      success: false,
      errors: result.error.errors.reduce((acc, curr) => {
        const key = curr.path[0] as string;
        acc[key] = curr.message;
        return acc;
      }, {} as Record<string, string>),
    };
  }
  
  return {
    success: true,
    data: result.data,
  };
}

/**
 * Validate password change data against the schema
 * 
 * @param data - Password change data to validate
 * @returns Validation result with success flag and errors if any
 */
export function validatePasswordChange(data: unknown) {
  const result = passwordChangeSchema.safeParse(data);
  
  if (!result.success) {
    return {
      success: false,
      errors: result.error.errors.reduce((acc, curr) => {
        const key = curr.path[0] as string;
        acc[key] = curr.message;
        return acc;
      }, {} as Record<string, string>),
    };
  }
  
  return {
    success: true,
    data: result.data,
  };
}
