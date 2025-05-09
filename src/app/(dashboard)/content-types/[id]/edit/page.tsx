"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  AlertCircle, 
  ChevronLeft,
  Plus, 
  X 
} from "lucide-react";
import { updateContentTypeSchema } from "@/lib/validations/content.validation";
import { useToast } from "@/components/ui/use-toast";
import { FieldType } from "@/types/content.types";

// Use the update schema but provide a more specific type for the form
type FormValues = {
  name?: string;
  slug?: string;
  description?: string;
  fields?: {
    name: string;
    label: string;
    type: FieldType;
    required: boolean;
    defaultValue?: string;
    options?: any[];
    validation?: Record<string, any>;
  }[];
  isSystem?: boolean;
};

const FIELD_TYPES: { value: FieldType; label: string }[] = [
  { value: "text", label: "Text" },
  { value: "textarea", label: "Text Area" },
  { value: "rich-text", label: "Rich Text" },
  { value: "number", label: "Number" },
  { value: "date", label: "Date" },
  { value: "boolean", label: "Boolean" },
  { value: "media", label: "Media" },
  { value: "reference", label: "Reference" },
];

export default function EditContentTypePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(updateContentTypeSchema) as any,
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      fields: [],
      isSystem: false,
    },
  });

  // Field array for managing dynamic fields
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "fields",
  });

  // Fetch content type data
  useEffect(() => {
    const fetchContentType = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/content-types/${params.id}`);
        if (!response.ok) {
          throw new Error("Failed to fetch content type");
        }
        
        const data = await response.json();
        
        // Set form default values from the fetched data
        form.reset({
          name: data.name,
          slug: data.slug,
          description: data.description || "",
          fields: data.fields as any[], // Cast to any[] as the fields structure is dynamic
          isSystem: data.isSystem,
        });
      } catch (error) {
        console.error("Error fetching content type:", error);
        setError("Failed to load content type. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchContentType();
  }, [params.id, form]);

  // Auto-generate slug from name
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    // Only auto-generate slug if the field is empty or matches a slugified version of the previous name
    const currentSlug = form.getValues("slug") || "";
    const currentName = form.getValues("name") || "";
    
    if (!currentSlug || currentSlug === slugify(currentName)) {
      form.setValue("slug", slugify(name));
    }
  };

  // Slugify a string (convert to lowercase, replace spaces with hyphens, etc.)
  const slugify = (text: string): string => {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  // Add new field
  const addField = () => {
    append({
      name: "",
      label: "",
      type: "text",
      required: false,
      defaultValue: "",
    });
  };

  // Auto-generate field name from label
  const handleFieldLabelChange = (index: number, value: string) => {
    const fieldName = value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_|_$/g, "");
    form.setValue(`fields.${index}.name` as any, fieldName);
  };

  // Submit form
  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/content-types/${params.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update content type");
      }

      toast({
        title: "Success",
        description: "Content type updated successfully",
      });
      
      router.push(`/content-types/${params.id}`);
    } catch (error: any) {
      console.error("Error updating content type:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update content type",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container py-10">
        <div className="flex justify-center items-center h-64">
          <p className="text-muted-foreground">Loading content type...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-10">
        <div className="flex flex-col items-center justify-center h-64 space-y-4">
          <AlertCircle className="h-10 w-10 text-destructive" />
          <h2 className="text-xl font-semibold">Error</h2>
          <p className="text-muted-foreground">{error}</p>
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
    <div className="container py-6">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" size="sm" asChild>
          <Link href={`/content-types/${params.id}`}>
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">Edit Content Type</h1>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          onChange={(e) => {
                            field.onChange(e);
                            handleNameChange(e);
                          }}
                          placeholder="e.g. Blog Post"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="slug"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Slug</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="e.g. blog-post"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="Describe this content type..."
                          rows={4}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isSystem"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel>System Content Type</FormLabel>
                        <div className="text-sm text-muted-foreground">
                          Mark as a system content type (can't be deleted)
                        </div>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Fields</CardTitle>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addField}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Field
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {fields.length === 0 ? (
                  <div className="text-center py-4 text-muted-foreground">
                    No fields defined. Click "Add Field" to start adding fields.
                  </div>
                ) : (
                  fields.map((field, index) => (
                    <div
                      key={field.id}
                      className="relative p-4 border rounded-md space-y-4"
                    >
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={() => remove(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name={`fields.${index}.label`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Field Label</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  placeholder="e.g. Title"
                                  onChange={(e) => {
                                    field.onChange(e);
                                    handleFieldLabelChange(index, e.target.value);
                                  }}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`fields.${index}.name`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Field Name</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  placeholder="e.g. title"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name={`fields.${index}.type`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Field Type</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select field type" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {FIELD_TYPES.map((type) => (
                                    <SelectItem
                                      key={type.value}
                                      value={type.value}
                                    >
                                      {type.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`fields.${index}.required`}
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center gap-2 mt-8">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <div>
                                <FormLabel>Required field</FormLabel>
                              </div>
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name={`fields.${index}.defaultValue`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Default Value</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="Leave empty for no default value"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  ))
                )}

                {fields.length > 0 && (
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={addField}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Another Field
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              disabled={isSubmitting}
              asChild
            >
              <Link href={`/content-types/${params.id}`}>Cancel</Link>
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
