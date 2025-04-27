"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { 
  ChevronLeft, 
  Pencil,
  Trash2, 
  Plus, 
  Eye,
  Copy,
  AlertCircle
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { formatDate } from "@/lib/utils/format";

// Field type mapping for human-readable display
const fieldTypeMap: Record<string, string> = {
  "text": "Text",
  "textarea": "Multi-line Text",
  "rich-text": "Rich Text Editor",
  "number": "Number",
  "date": "Date",
  "datetime": "Date & Time",
  "boolean": "True/False",
  "media": "Media",
  "reference": "Reference",
  "select": "Select",
  "multi-select": "Multiple Select",
  "email": "Email",
  "url": "URL",
  "color": "Color",
  "json": "JSON",
  "password": "Password"
};

export default function ContentTypeDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [contentType, setContentType] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
  useEffect(() => {
    fetchContentType();
  }, [params.id]);
  
  const fetchContentType = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/content-types/${params.id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch content type");
      }
      const data = await response.json();
      setContentType(data);
    } catch (error) {
      console.error("Error fetching content type:", error);
      toast({
        title: "Error",
        description: "Failed to load content type details",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/content-types/${params.id}`, {
        method: "DELETE",
      });
      
      if (!response.ok) {
        throw new Error("Failed to delete content type");
      }
      
      toast({
        title: "Success",
        description: "Content type deleted successfully",
        variant: "success",
      });
      
      router.push("/content-types");
    } catch (error) {
      console.error("Error deleting content type:", error);
      toast({
        title: "Error",
        description: "Failed to delete content type",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className="container py-10">
        <div className="flex justify-center items-center h-64">
          <p className="text-muted-foreground">Loading content type details...</p>
        </div>
      </div>
    );
  }
  
  if (!contentType) {
    return (
      <div className="container py-10">
        <div className="flex flex-col items-center justify-center h-64 space-y-4">
          <AlertCircle className="h-10 w-10 text-destructive" />
          <h2 className="text-xl font-semibold">Content Type Not Found</h2>
          <p className="text-muted-foreground">
            The content type you're looking for doesn't exist or has been removed.
          </p>
          <Button asChild>
            <Link href="/content-types">
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back to Content Types
            </Link>
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container py-10 space-y-8">
      {/* Header with actions */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/content-types">
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">{contentType.name}</h1>
          <Badge>{contentType.slug}</Badge>
        </div>
        
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/content-types/${params.id}/edit`}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </Link>
          </Button>
          
          <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
            <DialogTrigger asChild>
              <Button variant="destructive" size="sm">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete Content Type</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete the "{contentType.name}" content type?
                  This will also delete all content entries of this type.
                  This action cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="flex space-x-2 justify-end">
                <Button 
                  variant="outline" 
                  onClick={() => setShowDeleteDialog(false)}
                >
                  Cancel
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={handleDelete}
                  disabled={isDeleting}
                >
                  {isDeleting ? "Deleting..." : "Delete Content Type"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      {/* Content Type Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Content Type Details</CardTitle>
            <CardDescription>
              Basic information about this content type
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Display Name</h3>
                <p className="text-base">{contentType.name}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">API Identifier</h3>
                <p className="text-base font-mono">{contentType.slug}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Description</h3>
                <p className="text-base">{contentType.description || "No description provided"}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Created At</h3>
                <p className="text-base">{formatDate(contentType.createdAt)}</p>
              </div>
              {contentType.isSystem && (
                <div>
                  <Badge variant="secondary">System Type</Badge>
                  <p className="text-sm text-muted-foreground mt-1">This is a system content type and has some restrictions</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Actions</CardTitle>
            <CardDescription>
              Manage this content type and its content
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button className="w-full" asChild>
              <Link href={`/contents/create?contentTypeId=${contentType.id}`}>
                <Plus className="mr-2 h-4 w-4" />
                Create New Content
              </Link>
            </Button>
            <Button variant="outline" className="w-full" asChild>
              <Link href={`/contents?contentTypeId=${contentType.id}`}>
                <Eye className="mr-2 h-4 w-4" />
                View Content Entries
              </Link>
            </Button>
            <Button variant="outline" className="w-full" asChild>
              <Link href={`/content-types/${params.id}/duplicate`}>
                <Copy className="mr-2 h-4 w-4" />
                Duplicate Type
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
      
      {/* Fields */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Fields</CardTitle>
            <CardDescription>
              Structure and fields defined for this content type
            </CardDescription>
          </div>
          <Button size="sm" asChild>
            <Link href={`/content-types/${params.id}/fields/create`}>
              <Plus className="mr-2 h-4 w-4" />
              Add Field
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {contentType.fields && contentType.fields.length > 0 ? (
            <div className="border rounded-md divide-y">
              {contentType.fields.map((field: any, index: number) => (
                <div key={index} className="p-4 flex justify-between items-center">
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="font-medium">{field.label}</h3>
                      <Badge variant="outline" className="text-xs">{field.name}</Badge>
                      {field.required && (
                        <Badge className="bg-red-100 text-red-800 text-xs">Required</Badge>
                      )}
                    </div>
                    <div className="flex items-center mt-1 text-sm text-muted-foreground">
                      <span>{fieldTypeMap[field.type] || field.type}</span>
                      {field.description && (
                        <span className="ml-2 text-xs">{field.description}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="ghost" asChild>
                      <Link href={`/content-types/${params.id}/fields/${index}/edit`}>
                        <Pencil className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <p className="text-muted-foreground mb-4">No fields have been defined for this content type yet.</p>
              <Button asChild>
                <Link href={`/content-types/${params.id}/fields/create`}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add First Field
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Advanced Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Advanced Settings</CardTitle>
          <CardDescription>
            Configure additional options for this content type
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">API Endpoints</h3>
              <p className="text-sm mt-1">
                <code className="px-1 py-0.5 bg-muted rounded text-xs">/api/contents?type={contentType.slug}</code>
              </p>
              <p className="text-sm mt-1">
                <code className="px-1 py-0.5 bg-muted rounded text-xs">/api/contents/[id]</code>
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Taxonomies</h3>
              <div className="mt-1 flex flex-wrap gap-1">
                {contentType.taxonomies && contentType.taxonomies.length > 0 ? (
                  contentType.taxonomies.map((taxonomy: any, index: number) => (
                    <Badge key={index} variant="outline">{taxonomy.name || taxonomy}</Badge>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No taxonomies assigned</p>
                )}
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="border-t pt-6">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/content-types/${params.id}/settings`}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit Advanced Settings
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
