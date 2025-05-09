"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
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
import { Checkbox } from "@/components/ui/checkbox";
import { 
  RadioGroup,
  RadioGroupItem
} from "@/components/ui/radio-group";
import { Calendar } from "@/components/ui/calendar";
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  CalendarIcon, 
  Loader2,
  Save
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils/cn";
import { ContentStatus, ContentType } from "@prisma/client";
import { 
  getContentTypes, 
  getContentType, 
  createContent
} from "@/lib/services/content.service";
import { contentSchema } from "@/lib/validations/content.validation";
import { useToast } from "@/components/ui/use-toast";
import { FieldDefinition, FieldType } from "@/types/content.types";

// Form schema for content creation
// Define specific form schema type to ensure status is required
type ContentFormValues = z.infer<typeof contentSchema>;

const formSchema = contentSchema;

export default function CreateContentPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [contentTypes, setContentTypes] = useState<ContentType[]>([]);
  const [selectedContentType, setSelectedContentType] = useState<ContentType | null>(null);
  const [contentTypeFields, setContentTypeFields] = useState<FieldDefinition[]>([]);

  // Define form type with explicit required status
  type ContentFormValues = z.infer<typeof formSchema> & {
    status: ContentStatus; // Make status explicitly required
    [key: string]: any; // Allow dynamic field names for custom fields
  };

  const form = useForm<ContentFormValues>({
    resolver: zodResolver(formSchema) as any, // Use type assertion to bypass resolver type issues
    defaultValues: {
      title: "",
      slug: "",
      contentTypeId: "",
      status: ContentStatus.DRAFT,
      content: "",
      excerpt: "",
      customFields: {},
    },
  });

  // Load content types on initial render
  useEffect(() => {
    const loadContentTypes = async () => {
      try {
        const result = await getContentTypes({ limit: 100 });
        setContentTypes(result.data);
        setIsLoading(false);
      } catch (error) {
        console.error("Error loading content types:", error);
        toast({
          title: "Error",
          description: "Failed to load content types",
          variant: "destructive",
        });
      }
    };

    loadContentTypes();
  }, [toast]);

  // Auto-generate slug from title
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    form.setValue("slug", slug);
  };

  // Handle content type change
  const handleContentTypeChange = async (contentTypeId: string) => {
    if (!contentTypeId) {
      setSelectedContentType(null);
      setContentTypeFields([]);
      return;
    }

    try {
      const contentType = await getContentType(contentTypeId);
      setSelectedContentType(contentType);
      
      // Parse fields from content type
      const fields = contentType.fields as FieldDefinition[];
      setContentTypeFields(fields);
      
      // Initialize custom fields with default values
      const customFields: Record<string, any> = {};
      fields.forEach((field) => {
        if (field.defaultValue !== undefined) {
          customFields[field.name] = field.defaultValue;
        }
      });

      form.setValue("contentTypeId", contentTypeId);
      form.setValue("customFields", customFields);
    } catch (error) {
      console.error("Error loading content type:", error);
      toast({
        title: "Error",
        description: "Failed to load content type details",
        variant: "destructive",
      });
    }
  };

  // Render field based on field type
  const renderField = (field: FieldDefinition) => {
    const fieldName = `customFields.${field.name}`;

    switch (field.type) {
      case "text":
        return (
          <FormField
            key={field.name}
            control={form.control}
            name={fieldName}
            render={({ field: formField }) => (
              <FormItem>
                <FormLabel>{field.label}{field.required && <span className="text-destructive"> *</span>}</FormLabel>
                <FormControl>
                  <Input {...formField} placeholder={field.label} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        );

      case "textarea":
        return (
          <FormField
            key={field.name}
            control={form.control}
            name={fieldName}
            render={({ field: formField }) => (
              <FormItem>
                <FormLabel>{field.label}{field.required && <span className="text-destructive"> *</span>}</FormLabel>
                <FormControl>
                  <Textarea {...formField} placeholder={field.label} rows={4} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        );

      case "rich-text":
        return (
          <FormField
            key={field.name}
            control={form.control}
            name={fieldName}
            render={({ field: formField }) => (
              <FormItem>
                <FormLabel>{field.label}{field.required && <span className="text-destructive"> *</span>}</FormLabel>
                <FormControl>
                  <Textarea {...formField} placeholder={field.label} rows={6} />
                </FormControl>
                <FormMessage />
                <div className="text-sm text-muted-foreground">
                  Rich text editor will be implemented in future updates
                </div>
              </FormItem>
            )}
          />
        );

      case "number":
        return (
          <FormField
            key={field.name}
            control={form.control}
            name={fieldName}
            render={({ field: formField }) => (
              <FormItem>
                <FormLabel>{field.label}{field.required && <span className="text-destructive"> *</span>}</FormLabel>
                <FormControl>
                  <Input 
                    type="number"
                    {...formField}
                    onChange={(e) => formField.onChange(Number(e.target.value))}
                    placeholder={field.label} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        );

      case "date":
        return (
          <FormField
            key={field.name}
            control={form.control}
            name={fieldName}
            render={({ field: formField }) => (
              <FormItem className="flex flex-col">
                <FormLabel>{field.label}{field.required && <span className="text-destructive"> *</span>}</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !formField.value && "text-muted-foreground"
                        )}
                      >
                        {formField.value ? (
                          format(new Date(formField.value), "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={formField.value ? new Date(formField.value) : undefined}
                      onSelect={formField.onChange}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        );

      case "boolean":
        return (
          <FormField
            key={field.name}
            control={form.control}
            name={fieldName}
            render={({ field: formField }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                <FormControl>
                  <Checkbox
                    checked={formField.value}
                    onCheckedChange={formField.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>
                    {field.label}
                    {field.required && <span className="text-destructive"> *</span>}
                  </FormLabel>
                </div>
              </FormItem>
            )}
          />
        );

      case "media":
        return (
          <FormField
            key={field.name}
            control={form.control}
            name={fieldName}
            render={({ field: formField }) => (
              <FormItem>
                <FormLabel>{field.label}{field.required && <span className="text-destructive"> *</span>}</FormLabel>
                <FormControl>
                  <Input {...formField} placeholder="Media selector coming soon" />
                </FormControl>
                <FormMessage />
                <div className="text-sm text-muted-foreground">
                  Media selector will be implemented in future updates
                </div>
              </FormItem>
            )}
          />
        );

      case "reference":
        return (
          <FormField
            key={field.name}
            control={form.control}
            name={fieldName}
            render={({ field: formField }) => (
              <FormItem>
                <FormLabel>{field.label}{field.required && <span className="text-destructive"> *</span>}</FormLabel>
                <FormControl>
                  <Input {...formField} placeholder="Reference selector coming soon" />
                </FormControl>
                <FormMessage />
                <div className="text-sm text-muted-foreground">
                  Reference selector will be implemented in future updates
                </div>
              </FormItem>
            )}
          />
        );

      default:
        return null;
    }
  };

  // Submit form
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    try {
      await createContent(values);
      toast({
        title: "Success",
        description: "Content created successfully",
      });
      router.push("/contents");
    } catch (error) {
      console.error("Error creating content:", error);
      toast({
        title: "Error",
        description: "Failed to create content",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container py-12 flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p>Loading content types...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-6">
      <h1 className="text-3xl font-bold mb-6">Create Content</h1>

      {contentTypes.length === 0 ? (
        <div className="bg-muted p-6 rounded-lg text-center">
          <h3 className="text-lg font-medium mb-2">No content types found</h3>
          <p className="text-muted-foreground mb-4">
            You need to create a content type before you can create content.
          </p>
          <Button
            onClick={() => router.push("/content-types/create")}
          >
            Create Content Type
          </Button>
        </div>
      ) : (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <Card>
              <CardContent className="pt-6">
                <div className="mb-6">
                  <FormField
                    control={form.control}
                    name="contentTypeId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Content Type</FormLabel>
                        <Select
                          onValueChange={(value) => {
                            field.onChange(value);
                            handleContentTypeChange(value);
                          }}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a content type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {contentTypes.map((type) => (
                              <SelectItem key={type.id} value={type.id}>
                                {type.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {selectedContentType && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Title</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                onChange={(e) => {
                                  field.onChange(e);
                                  handleTitleChange(e);
                                }}
                                placeholder="Enter title"
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
                                placeholder="Enter slug"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <Tabs defaultValue="fields">
                      <TabsList className="mb-4">
                        <TabsTrigger value="fields">Content Fields</TabsTrigger>
                        <TabsTrigger value="details">Details</TabsTrigger>
                        <TabsTrigger value="seo">SEO</TabsTrigger>
                      </TabsList>

                      <TabsContent value="fields" className="space-y-4">
                        {contentTypeFields.length > 0 ? (
                          contentTypeFields.map((field) => renderField(field))
                        ) : (
                          <div className="text-center py-4 text-muted-foreground">
                            This content type has no fields defined.
                          </div>
                        )}
                      </TabsContent>

                      <TabsContent value="details" className="space-y-4">
                        <FormField
                          control={form.control}
                          name="excerpt"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Excerpt</FormLabel>
                              <FormControl>
                                <Textarea
                                  {...field}
                                  placeholder="Enter a short excerpt"
                                  rows={3}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="content"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Content</FormLabel>
                              <FormControl>
                                <Textarea
                                  {...field}
                                  placeholder="Enter content"
                                  rows={10}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="status"
                          render={({ field }) => (
                            <FormItem className="space-y-3">
                              <FormLabel>Status</FormLabel>
                              <FormControl>
                                <RadioGroup
                                  onValueChange={field.onChange}
                                  defaultValue={field.value}
                                  className="flex flex-col space-y-1"
                                >
                                  <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="DRAFT" id="status-draft" />
                                    <label htmlFor="status-draft">Draft</label>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="PUBLISHED" id="status-published" />
                                    <label htmlFor="status-published">Published</label>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="ARCHIVED" id="status-archived" />
                                    <label htmlFor="status-archived">Archived</label>
                                  </div>
                                </RadioGroup>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </TabsContent>

                      <TabsContent value="seo" className="space-y-4">
                        <div className="text-sm text-muted-foreground mb-4">
                          SEO settings will be implemented in future updates
                        </div>
                      </TabsContent>
                    </Tabs>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/contents")}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting || !selectedContentType}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Create Content
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      )}
    </div>
  );
}
