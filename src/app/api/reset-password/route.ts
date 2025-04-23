import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { hash } from 'bcryptjs';
import { z } from 'zod';

// Define validation schema
const resetPasswordSchema = z.object({
  token: z.string().min(1, { message: "Token is required" }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters long" })
    .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter" })
    .regex(/[a-z]/, { message: "Password must contain at least one lowercase letter" })
    .regex(/[0-9]/, { message: "Password must contain at least one number" })
});

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json();
    
    const validationResult = resetPasswordSchema.safeParse(body);
    
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
    
    const { token, password } = validationResult.data;
    
    // Find token in database
    const verificationToken = await prisma.verificationToken.findUnique({
      where: { token },
    });
    
    // Check if token exists and is not expired
    if (!verificationToken) {
      return NextResponse.json(
        { success: false, message: 'Invalid or expired token' },
        { status: 404 }
      );
    }
    
    if (new Date() > verificationToken.expires) {
      return NextResponse.json(
        { success: false, message: 'Token has expired' },
        { status: 410 }
      );
    }
    
    // Find user associated with token
    const user = await prisma.user.findUnique({
      where: { email: verificationToken.identifier },
    });
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }
    
    // Hash new password
    const hashedPassword = await hash(password, 12);
    
    // Update user's password
    await prisma.user.update({
      where: { id: user.id },
      data: { 
        hashedPassword,
        // Update lastLogin when user resets password
        lastLogin: new Date()
      },
    });
    
    // Delete the used token to prevent reuse
    await prisma.verificationToken.delete({
      where: { id: verificationToken.id },
    });
    
    return NextResponse.json(
      { success: true, message: 'Password has been reset successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('[RESET_PASSWORD_ERROR]', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error while resetting password' },
      { status: 500 }
    );
  }
}
