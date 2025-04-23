import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { hash } from 'bcryptjs';
import { z } from 'zod';

// Define validation schema using Zod
const userSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters long" })
    .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter" })
    .regex(/[a-z]/, { message: "Password must contain at least one lowercase letter" })
    .regex(/[0-9]/, { message: "Password must contain at least one number" }),
  username: z.string().min(3, { message: "Username must be at least 3 characters long" })
});

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json();
    
    const validationResult = userSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Validation failed', 
          errors: validationResult.error.errors 
        }, 
        { status: 400 }
      );
    }
    
    const { email, password, username } = validationResult.data;
    
    // Check if user already exists
    const existingUserByEmail = await prisma.user.findUnique({
      where: { email },
    });
    
    if (existingUserByEmail) {
      return NextResponse.json(
        { success: false, message: 'Email already registered' },
        { status: 409 }
      );
    }
    
    // Check if username is taken
    if (username) {
      const existingUserByUsername = await prisma.user.findUnique({
        where: { username },
      });
      
      if (existingUserByUsername) {
        return NextResponse.json(
          { success: false, message: 'Username already taken' },
          { status: 409 }
        );
      }
    }
    
    // Get default user role (or create it if it doesn't exist)
    let userRole = await prisma.role.findFirst({
      where: { name: 'user' },
    });
    
    if (!userRole) {
      userRole = await prisma.role.create({
        data: {
          name: 'user',
          description: 'Default user role',
          permissions: ['content:read'],
          isSystem: true,
        },
      });
    }
    
    // Hash password
    const hashedPassword = await hash(password, 12);
    
    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        username,
        hashedPassword,
        displayName: username,
        status: 'ACTIVE',
        roleId: userRole.id,
        permissions: [],
      },
    });
    
    // Remove sensitive data before returning response
    const { hashedPassword: _, ...userWithoutPassword } = user;
    
    return NextResponse.json(
      { 
        success: true, 
        message: 'User registered successfully',
        user: userWithoutPassword
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[REGISTER_ERROR]', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Internal server error during registration' 
      },
      { status: 500 }
    );
  }
}
