"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Content, ContentStatus, ContentType } from "@prisma/client";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { 
  ArrowLeft, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  Edit, 
  Loader2, 
  User 
} from "lucide-react";
import { getContent } from "@/lib/services/content.service";
import { formatDate } from "@/lib/utils/format";
import { FieldDefinition } from "@/types/content.types";
import { useToast } from "@/components/ui/use-toast";

export default function ContentDetailPage() {
  const router = useRouter();
  const params = useParams();
  const contentId = params.id as string;
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [content, setContent] = useState<Content & { 
    contentType: ContentType;
    author?: { 
      id: string;
      username?: string | null;
      displayName?: string | null;
      avatar?: string | null;
    } | null;
    createdBy?: {
      id: string;
      username?: string | null;
      displayName?: string | null;
    } | null;
    updatedBy?: {
      id: string;
      username?: string | null;
      displayName?: string | null;
    } | null;
    revisions?: any[] | null;
  } | null>(null);
  const [contentTypeFields, setContentTypeFields] = useState<FieldDefinition[]>([]);

  // Load content data on initial render
  useEffect(() => {
    const loadContentData = async () => {
      try {
        const contentData = await getContent(contentId);
        setContent(contentData);
        
        // Parse fields from content type
        if (contentData.contentType.fields) {
          const fields = contentData.contentType.fields as FieldDefinition[];
          setContentTypeFields(fields);
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error("Error loading content:", error);
        toast({
          title: "Error",
          description: "Failed to load content data",
          variant: "destructive",
        });
      }
    };

    loadContentData();
  }, [contentId, toast]);

  // Get status badge variant
  const getStatusBadgeVariant = (status: ContentStatus) => {
    switch (status) {
      case "PUBLISHED":
        return "success";
      case "DRAFT":
        return "secondary";
      case "ARCHIVED":
        return "outline";
      default:
        return "default";
    }
  };

  // Render custom field value based on field type
  const renderFieldValue = (field: FieldDefinition, value: any) => {
    if (value === undefined || value === null) {
      return <span className="text-muted-foreground">Not set</span>;
    }

    switch (field.type) {
      case "text":
      case "textarea":
      case "rich-text":
        return <span>{value}</span>;
        
      case "number":
        return <span>{value}</span>;
        
      case "date":
        return value ? <span>{formatDate(value)}</span> : <span className="text-muted-foreground">Not set</span>;
        
      case "boolean":
        return value ? 
          <CheckCircle2 className="h-5 w-5 text-primary" /> : 
          <span className="text-muted-foreground">No</span>;
        
      case "media":
        return value ? <span>{value}</span> : <span className="text-muted-foreground">No media</span>;
        
      case "reference":
        return value ? <span>{value}</span> : <span className="text-muted-foreground">No reference</span>;
        
      default:
        return <span>{JSON.stringify(value)}</span>;
    }
  };

  if (isLoading) {
    return (
      <div className="container py-12 flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p>Loading content...</p>
        </div>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="container py-12">
        <Card>
          <CardHeader>
            <CardTitle>Content Not Found</CardTitle>
            <CardDescription>
              The content you are looking for does not exist or has been removed.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button asChild>
              <Link href="/contents">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Contents
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/contents">
                <ArrowLeft className="h-4 w-4" />
                <span className="sr-only">Back</span>
              </Link>
            </Button>
            <h1 className="text-3xl font-bold">{content.title}</h1>
            <Badge variant={getStatusBadgeVariant(content.status) as any}>
              {content.status}
            </Badge>
          </div>
          <p className="text-muted-foreground">
            Content Type: <span className="font-medium">{content.contentType.name}</span>
          </p>
        </div>
        <Button asChild>
          <Link href={`/contents/${content.id}/edit`}>
            <Edit className="mr-2 h-4 w-4" />
            Edit Content
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-2 mb-2">
            <div>
              <CardTitle>Content Details</CardTitle>
              <CardDescription>View all details for this content</CardDescription>
            </div>
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              <div className="flex items-center">
                <Calendar className="mr-1 h-4 w-4" />
                {content.publishedAt ? (
                  <span>Published: {formatDate(content.publishedAt)}</span>
                ) : (
                  <span>Not published</span>
                )}
              </div>
              <div className="flex items-center">
                <Clock className="mr-1 h-4 w-4" />
                <span>Updated: {formatDate(content.updatedAt)}</span>
              </div>
              {content.author && (
                <div className="flex items-center">
                  <User className="mr-1 h-4 w-4" />
                  <span>Author: {content.author.displayName || content.author.username}</span>
                </div>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="overview">
            <TabsList className="mb-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="custom-fields">Custom Fields</TabsTrigger>
              <TabsTrigger value="content">Content</TabsTrigger>
              {content.revisions && Array.isArray(content.revisions) && content.revisions.length > 0 && (
                <TabsTrigger value="revisions">Revisions</TabsTrigger>
              )}
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium mb-2">Basic Information</h3>
                  <div className="space-y-3">
                    <div>
                      <div className="text-sm font-medium">Title</div>
                      <div>{content.title}</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium">Slug</div>
                      <div>{content.slug}</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium">Status</div>
                      <Badge variant={getStatusBadgeVariant(content.status) as any}>
                        {content.status}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-medium mb-2">Metadata</h3>
                  <div className="space-y-3">
                    <div>
                      <div className="text-sm font-medium">Content Type</div>
                      <div>{content.contentType.name}</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium">Created</div>
                      <div>{formatDate(content.createdAt)}</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium">Last Updated</div>
                      <div>{formatDate(content.updatedAt)}</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium">Published</div>
                      <div>
                        {content.publishedAt 
                          ? formatDate(content.publishedAt) 
                          : <span className="text-muted-foreground">Not published</span>}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {content.excerpt && (
                <div className="pt-4">
                  <h3 className="text-lg font-medium mb-2">Excerpt</h3>
                  <div className="bg-muted p-4 rounded-md whitespace-pre-wrap">
                    {content.excerpt}
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="custom-fields" className="space-y-4">
              {contentTypeFields.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {contentTypeFields.map((field) => (
                    <div key={field.name} className="space-y-1">
                      <div className="text-sm font-medium">
                        {field.label}
                        {field.required && <span className="text-destructive ml-1">*</span>}
                      </div>
                      <div>
                        {renderFieldValue(
                          field, 
                          content.customFields && 
                          typeof content.customFields === 'object' && 
                          !Array.isArray(content.customFields) ? 
                          (content.customFields as Record<string, any>)[field.name] : 
                          undefined
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center text-muted-foreground">
                  This content type has no custom fields defined.
                </div>
              )}
            </TabsContent>

            <TabsContent value="content" className="space-y-4">
              {content.content ? (
                <div className="bg-muted p-4 rounded-md whitespace-pre-wrap">
                  {content.content}
                </div>
              ) : (
                <div className="py-12 text-center text-muted-foreground">
                  No content available.
                </div>
              )}
            </TabsContent>

            {content.revisions && Array.isArray(content.revisions) && content.revisions.length > 0 && (
              <TabsContent value="revisions" className="space-y-4">
                <div className="space-y-4">
                  {content.revisions.map((revision: any, index: number) => (
                    <div key={index} className="border rounded-md p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div className="font-medium">
                          Revision {Array.isArray(content.revisions) ? content.revisions.length - index : 0}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {formatDate(revision.updatedAt)}
                        </div>
                      </div>
                      <Separator className="my-2" />
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <div className="font-medium mb-1">Title</div>
                          <div>{revision.title}</div>
                        </div>
                        <div>
                          <div className="font-medium mb-1">Status</div>
                          <div>{revision.status}</div>
                        </div>
                        {revision.updatedBy && revision.updatedBy.id && (
                          <div>
                            <div className="font-medium mb-1">Updated By</div>
                            <div>{revision.updatedBy.id}</div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
            )}
          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" asChild>
            <Link href="/contents">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Contents
            </Link>
          </Button>
          <Button asChild>
            <Link href={`/contents/${content.id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Content
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
