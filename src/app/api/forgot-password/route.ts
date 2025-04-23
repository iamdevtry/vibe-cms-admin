import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { randomBytes } from 'crypto';
import { z } from 'zod';

// Define validation schema
const forgotPasswordSchema = z.object({
  email: z.string().email({ message: "Invalid email address" })
});

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json();
    
    const validationResult = forgotPasswordSchema.safeParse(body);
    
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
    
    const { email } = validationResult.data;
    
    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email },
    });
    
    // Note: For security reasons, we always return success even if the user doesn't exist
    // This prevents user enumeration attacks
    if (!user) {
      return NextResponse.json(
        { 
          success: true, 
          message: 'If a user with that email exists, we have sent a password reset link' 
        },
        { status: 200 }
      );
    }
    
    // Check if account is active
    if (user.status !== 'ACTIVE') {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Account is inactive or suspended. Please contact an administrator.' 
        },
        { status: 403 }
      );
    }
    
    // Generate a secure token
    const token = randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 3600000); // Token expires in 1 hour
    
    // Store the verification token
    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token,
        expires,
      },
    });
    
    // Here we would normally send an email with a reset link
    // For development purposes, we'll just log the token
    console.log(`[DEV ONLY] Reset token for ${email}: ${token}`);
    console.log(`[DEV ONLY] Reset link: ${process.env.NEXTAUTH_URL}/reset-password?token=${token}`);
    
    // In a production environment, you would use an email service like SendGrid, AWS SES, etc.
    // Example code for sending email (commented out):
    /*
    await sendEmail({
      to: email,
      subject: "Reset your password",
      html: `
        <h1>Reset Your Password</h1>
        <p>Click the link below to reset your password:</p>
        <a href="${process.env.NEXTAUTH_URL}/reset-password?token=${token}">
          Reset Password
        </a>
        <p>This link will expire in 1 hour.</p>
      `,
    });
    */
    
    return NextResponse.json(
      { 
        success: true, 
        message: 'If a user with that email exists, we have sent a password reset link' 
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[FORGOT_PASSWORD_ERROR]', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Internal server error while processing password reset request' 
      },
      { status: 500 }
    );
  }
}
