import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { db } from "@/lib/db";
import { contentSchema } from "@/lib/validations/content.validation";
import { hasPermission } from "@/lib/auth/permissions";

// GET /api/contents
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!hasPermission(session, "content:read")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const url = new URL(req.url);
    const searchParams = url.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;
    const search = searchParams.get("search") || "";
    const contentTypeId = searchParams.get("contentTypeId") || undefined;
    const status = searchParams.get("status") || undefined;
    const authorId = searchParams.get("authorId") || undefined;

    // Build the where clause based on search parameters
    const where: any = {
      ...(contentTypeId && { contentTypeId }),
      ...(status && { status }),
      ...(authorId && { authorId }),
      ...(search && {
        OR: [
          { title: { contains: search, mode: "insensitive" } },
          { slug: { contains: search, mode: "insensitive" } },
          { excerpt: { contains: search, mode: "insensitive" } },
        ],
      }),
    };

    // Get total count for pagination
    const totalCount = await db.content.count({ where });

    // Get contents with pagination, filtering, and search
    const contents = await db.content.findMany({
      where,
      include: {
        contentType: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
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
      skip,
      take: limit,
      orderBy: {
        updatedAt: "desc",
      },
    });

    return NextResponse.json({
      data: contents,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error("Error getting contents:", error);
    return NextResponse.json(
      { error: "Failed to fetch contents" },
      { status: 500 }
    );
  }
}

// POST /api/contents
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!hasPermission(session, "content:create")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    
    // Validate request body
    const validationResult = contentSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid data", details: validationResult.error.format() },
        { status: 400 }
      );
    }
    
    const {
      title,
      slug,
      contentTypeId,
      status,
      publishedAt,
      content,
      excerpt,
      customFields,
      seo,
      authorId,
    } = validationResult.data;
    
    // Check if content type exists
    const contentType = await db.contentType.findUnique({
      where: { id: contentTypeId },
    });
    
    if (!contentType) {
      return NextResponse.json(
        { error: "Content type not found" },
        { status: 404 }
      );
    }
    
    // Check if slug is unique for this content type
    const existingContent = await db.content.findFirst({
      where: {
        contentTypeId,
        slug,
      },
    });
    
    if (existingContent) {
      return NextResponse.json(
        { error: "Content with this slug already exists for this content type" },
        { status: 409 }
      );
    }
    
    // Set author to current user if not specified
    const effectiveAuthorId = authorId || session.user.id;
    
    // Create new content
    const newContent = await db.content.create({
      data: {
        title,
        slug,
        contentTypeId,
        status,
        publishedAt,
        content,
        excerpt,
        customFields,
        seo,
        authorId: effectiveAuthorId,
        createdById: session.user.id,
        updatedById: session.user.id,
      },
    });
    
    return NextResponse.json(newContent, { status: 201 });
  } catch (error) {
    console.error("Error creating content:", error);
    return NextResponse.json(
      { error: "Failed to create content" },
      { status: 500 }
    );
  }
}
