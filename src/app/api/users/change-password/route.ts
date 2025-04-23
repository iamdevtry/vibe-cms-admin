import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import prisma from '@/lib/prisma';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { hash, compare } from 'bcryptjs';
import { z } from 'zod';

// Define validation schema
const passwordChangeSchema = z.object({
  currentPassword: z.string().min(1, { message: "Current password is required" }),
  newPassword: z
    .string()
    .min(8, { message: "New password must be at least 8 characters long" })
    .regex(/[A-Z]/, { message: "New password must contain at least one uppercase letter" })
    .regex(/[a-z]/, { message: "New password must contain at least one lowercase letter" })
    .regex(/[0-9]/, { message: "New password must contain at least one number" })
});

/**
 * POST /api/users/change-password
 * 
 * Changes the password of the currently authenticated user
 */
export async function POST(request: NextRequest) {
  try {
    // Get the current session
    const session = await getServerSession(authOptions);
    
    // Ensure user is authenticated
    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Parse and validate request body
    const body = await request.json();
    
    const validationResult = passwordChangeSchema.safeParse(body);
    
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
    
    const { currentPassword, newPassword } = validationResult.data;
    
    // Fetch user with password from database
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        hashedPassword: true,
      },
    });
    
    if (!user || !user.hashedPassword) {
      return NextResponse.json(
        { success: false, message: 'User not found or invalid authentication method' },
        { status: 404 }
      );
    }
    
    // Verify current password
    const isCurrentPasswordValid = await compare(currentPassword, user.hashedPassword);
    
    if (!isCurrentPasswordValid) {
      return NextResponse.json(
        { success: false, message: 'Current password is incorrect' },
        { status: 400 }
      );
    }
    
    // Ensure new password is different from current password
    if (currentPassword === newPassword) {
      return NextResponse.json(
        { success: false, message: 'New password must be different from current password' },
        { status: 400 }
      );
    }
    
    // Hash the new password
    const hashedPassword = await hash(newPassword, 12);
    
    // Update the user's password
    await prisma.user.update({
      where: { id: user.id },
      data: { hashedPassword },
    });
    
    return NextResponse.json(
      { success: true, message: 'Password changed successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('[CHANGE_PASSWORD_ERROR]', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
