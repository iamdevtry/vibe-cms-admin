import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { db } from "@/lib/db";
import { updateContentSchema } from "@/lib/validations/content.validation";
import { hasPermission } from "@/lib/auth/permissions";

// GET /api/contents/:id
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!hasPermission(session, "content:read")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const content = await db.content.findUnique({
      where: { id: params.id },
      include: {
        contentType: true,
        author: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatar: true,
          },
        },
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

    if (!content) {
      return NextResponse.json(
        { error: "Content not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(content);
  } catch (error) {
    console.error("Error getting content:", error);
    return NextResponse.json(
      { error: "Failed to fetch content" },
      { status: 500 }
    );
  }
}

// PATCH /api/contents/:id
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check for permission
    if (!hasPermission(session, "content:update")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    
    // Validate request body
    const validationResult = updateContentSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid data", details: validationResult.error.format() },
        { status: 400 }
      );
    }
    
    const {
      title,
      slug,
      status,
      publishedAt,
      content: contentBody,
      excerpt,
      customFields,
      seo,
      authorId,
    } = validationResult.data;
    
    // Check if content exists
    const existingContent = await db.content.findUnique({
      where: { id: params.id },
      include: {
        contentType: true,
      },
    });
    
    if (!existingContent) {
      return NextResponse.json(
        { error: "Content not found" },
        { status: 404 }
      );
    }
    
    // Check if slug is unique for this content type
    if (slug && slug !== existingContent.slug) {
      const duplicateSlug = await db.content.findFirst({
        where: {
          contentTypeId: existingContent.contentTypeId,
          slug,
          id: { not: params.id },
        },
      });
      
      if (duplicateSlug) {
        return NextResponse.json(
          { error: "Content with this slug already exists for this content type" },
          { status: 409 }
        );
      }
    }
    
    // Store current content as revision if content is changing
    let revisions = existingContent.revisions || [];
    
    if (contentBody && contentBody !== existingContent.content) {
      // Add current content to revisions
      const newRevision = {
        content: existingContent.content,
        updatedAt: new Date(),
        updatedById: existingContent.updatedById,
        updatedBy: {
          id: existingContent.updatedById || "",
        },
      };
      
      revisions = [newRevision, ...(revisions as any[])];
      
      // Limit to 10 revisions
      if (revisions.length > 10) {
        revisions = revisions.slice(0, 10);
      }
    }
    
    // Check if we're publishing
    const isPublishing = 
      status === "PUBLISHED" && existingContent.status !== "PUBLISHED";
    
    // If publishing without a publishedAt date, set it to now
    const effectivePublishedAt = 
      isPublishing && !publishedAt ? new Date() : publishedAt;
    
    // Update content
    const updatedContent = await db.content.update({
      where: { id: params.id },
      data: {
        ...(title && { title }),
        ...(slug && { slug }),
        ...(status && { status }),
        ...(effectivePublishedAt !== undefined && { publishedAt: effectivePublishedAt }),
        ...(contentBody !== undefined && { content: contentBody }),
        ...(excerpt !== undefined && { excerpt }),
        ...(customFields !== undefined && { customFields }),
        ...(seo !== undefined && { seo }),
        ...(authorId && { authorId }),
        ...(revisions.length > 0 && { revisions }),
        updatedById: session.user.id,
      },
      include: {
        contentType: true,
        author: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatar: true,
          },
        },
      },
    });
    
    return NextResponse.json(updatedContent);
  } catch (error) {
    console.error("Error updating content:", error);
    return NextResponse.json(
      { error: "Failed to update content" },
      { status: 500 }
    );
  }
}

// DELETE /api/contents/:id
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!hasPermission(session, "content:delete")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Check if content exists
    const content = await db.content.findUnique({
      where: { id: params.id },
    });
    
    if (!content) {
      return NextResponse.json(
        { error: "Content not found" },
        { status: 404 }
      );
    }
    
    // Delete content
    await db.content.delete({
      where: { id: params.id },
    });
    
    return NextResponse.json(null, { status: 204 });
  } catch (error) {
    console.error("Error deleting content:", error);
    return NextResponse.json(
      { error: "Failed to delete content" },
      { status: 500 }
    );
  }
}
