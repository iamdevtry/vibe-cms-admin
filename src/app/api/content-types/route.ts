import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { db } from "@/lib/db";
import { contentTypeSchema } from "@/lib/validations/content.validation";
import { hasPermission } from "@/lib/auth/permissions";

// GET /api/content-types
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check for permission
    if (!hasPermission(session.user.permissions || [], "content:read")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const url = new URL(req.url);
    const searchParams = url.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;
    const search = searchParams.get("search") || "";

    // Get total count for pagination
    const totalCount = await db.contentType.count({
      where: {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { slug: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
        ],
      },
    });

    // Get content types with pagination and search
    const contentTypes = await db.contentType.findMany({
      where: {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { slug: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
        ],
      },
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
      skip,
      take: limit,
      orderBy: {
        updatedAt: "desc",
      },
    });

    return NextResponse.json({
      data: contentTypes,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error("Error getting content types:", error);
    return NextResponse.json(
      { error: "Failed to fetch content types" },
      { status: 500 }
    );
  }
}

// POST /api/content-types
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check for permission
    if (!hasPermission(session.user.permissions || [], "content:create")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    
    // Validate request body
    const validationResult = contentTypeSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid data", details: validationResult.error.format() },
        { status: 400 }
      );
    }
    
    const { name, slug, description, fields, isSystem } = validationResult.data;
    
    // Check if slug is already taken
    const existingContentType = await db.contentType.findUnique({
      where: { slug },
    });
    
    if (existingContentType) {
      return NextResponse.json(
        { error: "Content type with this slug already exists" },
        { status: 409 }
      );
    }
    
    // Create new content type
    const newContentType = await db.contentType.create({
      data: {
        name,
        slug,
        description,
        fields,
        isSystem: isSystem || false,
        createdById: session.user.id,
        updatedById: session.user.id,
      },
    });
    
    return NextResponse.json(newContentType, { status: 201 });
  } catch (error) {
    console.error("Error creating content type:", error);
    return NextResponse.json(
      { error: "Failed to create content type" },
      { status: 500 }
    );
  }
}
