import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth/auth-options';

/**
 * GET /api/users/profile
 * 
 * Fetches the profile information of the currently authenticated user
 */
export async function GET(request: NextRequest) {
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
    
    // Fetch user data from database
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        username: true,
        email: true,
        firstName: true,
        lastName: true,
        displayName: true,
        avatar: true,
        bio: true,
        status: true,
        lastLogin: true,
        createdAt: true,
        updatedAt: true,
        // We specifically don't include hashedPassword for security reasons
      },
    });
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(user, { status: 200 });
  } catch (error) {
    console.error('[GET_PROFILE_ERROR]', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/users/profile
 * 
 * Updates the profile information of the currently authenticated user
 */
export async function PUT(request: NextRequest) {
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
    
    // Handle form data (for file uploads)
    const formData = await request.formData();
    const firstName = formData.get('firstName') as string;
    const lastName = formData.get('lastName') as string;
    const username = formData.get('username') as string;
    const email = formData.get('email') as string;
    const bio = formData.get('bio') as string;
    const avatarFile = formData.get('avatar') as File | null;
    
    // Validate required fields
    if (!username || !email) {
      return NextResponse.json(
        { success: false, message: 'Username and email are required' },
        { status: 400 }
      );
    }
    
    // Check if email is already in use by another user
    if (email !== session.user.email) {
      const existingUserWithEmail = await prisma.user.findFirst({
        where: {
          email,
          id: { not: session.user.id },
        },
      });
      
      if (existingUserWithEmail) {
        return NextResponse.json(
          { success: false, message: 'Email is already in use' },
          { status: 409 }
        );
      }
    }
    
    // Check if username is already in use by another user
    if (username) {
      const existingUserWithUsername = await prisma.user.findFirst({
        where: {
          username,
          id: { not: session.user.id },
        },
      });
      
      if (existingUserWithUsername) {
        return NextResponse.json(
          { success: false, message: 'Username is already taken' },
          { status: 409 }
        );
      }
    }
    
    // Process avatar if provided
    let avatarUrl: string | undefined = undefined;
    
    if (avatarFile) {
      // In a real production app, you would upload the file to a storage service
      // like AWS S3, Cloudinary, etc. and get back a URL
      
      // For this example, simulate file handling by generating a placeholder URL
      // NOTE: In a real app, replace this with actual file upload logic
      
      // Convert file to ArrayBuffer
      const buffer = await avatarFile.arrayBuffer();
      
      // NOTE: In production, save this buffer to a file or upload to a storage service
      // For now, we'll use a placeholder URL
      const fileName = `user_${session.user.id}_${Date.now()}.jpg`;
      avatarUrl = `/uploads/avatars/${fileName}`;
      
      // Log info for development
      console.log('[DEV_ONLY] Avatar file received:', {
        name: avatarFile.name,
        type: avatarFile.type,
        size: avatarFile.size,
        savedAs: fileName
      });
    }
    
    // Update user in database
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        username,
        email,
        firstName,
        lastName,
        displayName: `${firstName} ${lastName}`.trim() || username,
        bio,
        ...(avatarUrl && { avatar: avatarUrl }),
      },
    });
    
    // Remove sensitive data before returning
    const { hashedPassword, ...userWithoutPassword } = updatedUser;
    
    return NextResponse.json(userWithoutPassword, { status: 200 });
  } catch (error) {
    console.error('[UPDATE_PROFILE_ERROR]', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
