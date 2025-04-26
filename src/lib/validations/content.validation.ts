import { z } from "zod";
import { ContentStatus } from "@prisma/client";

// Field definition validation schema
export const fieldDefinitionSchema = z.object({
  name: z.string().min(1, "Field name is required"),
  label: z.string().min(1, "Field label is required"),
  type: z.enum([
    "text",
    "textarea",
    "rich-text",
    "number",
    "date",
    "boolean",
    "media",
    "reference",
  ]),
  required: z.boolean().default(false),
  defaultValue: z.any().optional(),
  options: z.array(z.any()).optional(),
  validation: z.record(z.any()).optional(),
});

// Content type validation schema
export const contentTypeSchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z
    .string()
    .min(1, "Slug is required")
    .regex(/^[a-z0-9-]+$/, "Slug must contain only lowercase letters, numbers, and hyphens"),
  description: z.string().optional(),
  fields: z.array(fieldDefinitionSchema),
  isSystem: z.boolean().optional().default(false),
});

// SEO metadata validation schema
export const seoMetadataSchema = z.object({
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  canonicalUrl: z.string().url().optional(),
  focusKeyword: z.string().optional(),
  metaRobots: z.string().optional(),
  structuredData: z.record(z.any()).optional(),
});

// Content validation schema
export const contentSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z
    .string()
    .min(1, "Slug is required")
    .regex(/^[a-z0-9-]+$/, "Slug must contain only lowercase letters, numbers, and hyphens"),
  contentTypeId: z.string().min(1, "Content Type is required"),
  status: z.nativeEnum(ContentStatus).default("DRAFT"),
  publishedAt: z.date().nullable().optional(),
  content: z.string().optional(),
  excerpt: z.string().optional(),
  customFields: z.record(z.any()).optional(),
  seo: seoMetadataSchema.optional(),
  authorId: z.string().optional(),
});

// Update content validation schema
export const updateContentSchema = contentSchema.partial();

// Update content type validation schema
export const updateContentTypeSchema = contentTypeSchema.partial();
