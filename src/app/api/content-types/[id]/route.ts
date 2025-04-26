import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { db } from "@/lib/db";
import { updateContentTypeSchema } from "@/lib/validations/content.validation";
import { hasPermission } from "@/lib/auth/permissions";

// GET /api/content-types/:id
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!hasPermission(session.user.permissions || [], "content:read")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const contentType = await db.contentType.findUnique({
      where: { id: params.id },
      include: {
        createdBy: {
          select: {
            id: true,
            username: true,
            displayName: true,
          },
        },
        updatedBy: {
          select: {
            id: true,
            username: true,
            displayName: true,
          },
        },
      },
    });

    if (!contentType) {
      return NextResponse.json(
        { error: "Content type not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(contentType);
  } catch (error) {
    console.error("Error getting content type:", error);
    return NextResponse.json(
      { error: "Failed to fetch content type" },
      { status: 500 }
    );
  }
}

// PATCH /api/content-types/:id
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!hasPermission(session.user.permissions || [], "content:update")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    
    // Validate request body
    const validationResult = updateContentTypeSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid data", details: validationResult.error.format() },
        { status: 400 }
      );
    }
    
    const { name, slug, description, fields, isSystem } = validationResult.data;
    
    // Check if content type exists
    const contentType = await db.contentType.findUnique({
      where: { id: params.id },
    });
    
    if (!contentType) {
      return NextResponse.json(
        { error: "Content type not found" },
        { status: 404 }
      );
    }
    
    // Check if slug is already taken by another content type
    if (slug && slug !== contentType.slug) {
      const existingContentType = await db.contentType.findUnique({
        where: { slug },
      });
      
      if (existingContentType && existingContentType.id !== params.id) {
        return NextResponse.json(
          { error: "Content type with this slug already exists" },
          { status: 409 }
        );
      }
    }
    
    // Update content type
    const updatedContentType = await db.contentType.update({
      where: { id: params.id },
      data: {
        ...(name && { name }),
        ...(slug && { slug }),
        ...(description !== undefined && { description }),
        ...(fields && { fields }),
        ...(isSystem !== undefined && { isSystem }),
        updatedById: session.user.id,
      },
    });
    
    return NextResponse.json(updatedContentType);
  } catch (error) {
    console.error("Error updating content type:", error);
    return NextResponse.json(
      { error: "Failed to update content type" },
      { status: 500 }
    );
  }
}

// DELETE /api/content-types/:id
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!hasPermission(session.user.permissions || [], "content:delete")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Check if content type exists
    const contentType = await db.contentType.findUnique({
      where: { id: params.id },
      include: {
        contents: {
          select: { id: true },
          take: 1,
        },
      },
    });
    
    if (!contentType) {
      return NextResponse.json(
        { error: "Content type not found" },
        { status: 404 }
      );
    }
    
    // Check if content type is system type
    if (contentType.isSystem) {
      return NextResponse.json(
        { error: "Cannot delete system content type" },
        { status: 403 }
      );
    }
    
    // Check if content type has associated contents
    if (contentType.contents.length > 0) {
      return NextResponse.json(
        { error: "Cannot delete content type that has associated contents" },
        { status: 409 }
      );
    }
    
    // Delete content type
    await db.contentType.delete({
      where: { id: params.id },
    });
    
    return NextResponse.json(null, { status: 204 });
  } catch (error) {
    console.error("Error deleting content type:", error);
    return NextResponse.json(
      { error: "Failed to delete content type" },
      { status: 500 }
    );
  }
}
