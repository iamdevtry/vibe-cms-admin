import { Content, ContentStatus, ContentType } from "@prisma/client";

// Field types for content type definition
export type FieldType = 
  | 'text'
  | 'textarea'
  | 'rich-text'
  | 'number'
  | 'date'
  | 'boolean'
  | 'media'
  | 'reference';

// Field definition for content type
export type FieldDefinition = {
  name: string;
  label: string;
  type: FieldType;
  required: boolean;
  defaultValue?: any;
  options?: any[];
  validation?: Record<string, any>;
};

// Content type with full field definitions
export type ContentTypeWithFields = ContentType & {
  fields: FieldDefinition[];
};

// Extended content type with relations
export type ContentTypeWithRelations = ContentType & {
  createdBy?: any;
  updatedBy?: any;
  contents?: Content[];
};

// SEO metadata for content
export type SEOMetadata = {
  metaTitle?: string;
  metaDescription?: string;
  canonicalUrl?: string;
  focusKeyword?: string;
  metaRobots?: string;
  structuredData?: Record<string, any>;
};

// Revision entry for content
export type RevisionEntry = {
  content: string;
  updatedAt: Date;
  updatedById?: string;
  updatedBy?: {
    id: string;
    displayName?: string;
  };
};

// Extended content with relations
export type ContentWithRelations = Content & {
  contentType: ContentType;
  author?: any;
  createdBy?: any;
  updatedBy?: any;
  seo?: SEOMetadata;
  revisions?: RevisionEntry[];
  customFields?: Record<string, any>;
};

// Form data for creating/updating content
export type ContentFormData = {
  title: string;
  slug: string;
  contentTypeId: string;
  status: ContentStatus;
  publishedAt?: Date | null;
  content?: string;
  excerpt?: string;
  customFields?: Record<string, any>;
  seo?: SEOMetadata;
  authorId?: string;
};

// Form data for creating/updating content type
export type ContentTypeFormData = {
  name: string;
  slug: string;
  description?: string;
  fields: FieldDefinition[];
  isSystem?: boolean;
};
