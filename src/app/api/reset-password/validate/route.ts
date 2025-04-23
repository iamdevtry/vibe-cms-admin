import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const token = request.nextUrl.searchParams.get('token');
    
    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Missing token' },
        { status: 400 }
      );
    }
    
    // Find token in database
    const verificationToken = await prisma.verificationToken.findUnique({
      where: { token },
    });
    
    // Check if token exists and is not expired
    if (!verificationToken) {
      return NextResponse.json(
        { success: false, message: 'Invalid token' },
        { status: 404 }
      );
    }
    
    if (new Date() > verificationToken.expires) {
      return NextResponse.json(
        { success: false, message: 'Token has expired' },
        { status: 410 }
      );
    }
    
    return NextResponse.json(
      { success: true, message: 'Token is valid' },
      { status: 200 }
    );
  } catch (error) {
    console.error('[VALIDATE_RESET_TOKEN_ERROR]', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error while validating token' },
      { status: 500 }
    );
  }
}
