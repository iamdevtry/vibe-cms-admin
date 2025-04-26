"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Content, ContentStatus, ContentType } from "@prisma/client";
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  ChevronRight, 
  MoreHorizontal, 
  PenSquare, 
  Plus, 
  Trash2 
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { 
  getContents, 
  deleteContent, 
  getContentTypes 
} from "@/lib/services/content.service";
import { formatDate } from "@/lib/utils/format";
import { useToast } from "@/hooks/use-toast";

type ContentWithType = Content & {
  contentType: ContentType;
};

export default function ContentsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedContentType, setSelectedContentType] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [contents, setContents] = useState<ContentWithType[]>([]);
  const [contentTypes, setContentTypes] = useState<ContentType[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  // Load content types and contents on initial render
  useEffect(() => {
    loadContentTypes();
    loadContents();
  }, []);

  // Function to load content types
  const loadContentTypes = async () => {
    try {
      const result = await getContentTypes({
        limit: 100,  // Get all content types for filter
      });
      setContentTypes(result.data);
    } catch (error) {
      console.error("Error loading content types:", error);
      toast({
        title: "Error",
        description: "Failed to load content types",
        variant: "destructive",
      });
    }
  };

  // Function to load contents
  const loadContents = async () => {
    setIsLoading(true);
    try {
      const result = await getContents({
        page,
        limit,
        search: search || undefined,
        contentTypeId: selectedContentType || undefined,
        status: selectedStatus || undefined,
      });
      setContents(result.data);
      setTotalPages(result.pagination.totalPages);
    } catch (error) {
      console.error("Error loading contents:", error);
      toast({
        title: "Error",
        description: "Failed to load contents",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  // Handle content type filter change
  const handleContentTypeChange = (value: string) => {
    setSelectedContentType(value);
    setPage(1);
  };

  // Handle status filter change
  const handleStatusChange = (value: string) => {
    setSelectedStatus(value);
    setPage(1);
  };

  // Handle search form submit
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadContents();
  };

  // Handle pagination
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    loadContents();
  };

  // Handle delete content
  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this content?")) {
      setIsDeleting(id);
      try {
        await deleteContent(id);
        toast({
          title: "Success",
          description: "Content deleted successfully",
        });
        loadContents();
      } catch (error) {
        console.error("Error deleting content:", error);
        toast({
          title: "Error",
          description: "Failed to delete content",
          variant: "destructive",
        });
      } finally {
        setIsDeleting(null);
      }
    }
  };

  // Map content status to badge variant
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

  return (
    <div className="container py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Contents</h1>
        <Button asChild>
          <Link href="/contents/create">
            <Plus className="mr-2 h-4 w-4" />
            Create Content
          </Link>
        </Button>
      </div>

      <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
        <form onSubmit={handleSearchSubmit} className="flex-1 flex space-x-2 w-full md:w-auto">
          <Input
            placeholder="Search contents..."
            value={search}
            onChange={handleSearchChange}
            className="max-w-sm"
          />
          <Button type="submit" variant="secondary">
            Search
          </Button>
        </form>

        <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
          <Select
            value={selectedContentType}
            onValueChange={handleContentTypeChange}
          >
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="All Content Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Content Types</SelectItem>
              {contentTypes.map((type) => (
                <SelectItem key={type.id} value={type.id}>
                  {type.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={selectedStatus}
            onValueChange={handleStatusChange}
          >
            <SelectTrigger className="w-full md:w-[150px]">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Statuses</SelectItem>
              <SelectItem value="PUBLISHED">Published</SelectItem>
              <SelectItem value="DRAFT">Draft</SelectItem>
              <SelectItem value="ARCHIVED">Archived</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" onClick={loadContents}>
            Apply Filters
          </Button>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableCaption>List of contents in your CMS</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Content Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Published At</TableHead>
              <TableHead>Updated</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-4">
                  Loading...
                </TableCell>
              </TableRow>
            ) : contents.length > 0 ? (
              contents.map((content) => (
                <TableRow key={content.id}>
                  <TableCell className="font-medium">{content.title}</TableCell>
                  <TableCell>{content.contentType.name}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(content.status) as any}>
                      {content.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {content.publishedAt ? formatDate(content.publishedAt) : "Not published"}
                  </TableCell>
                  <TableCell>{formatDate(content.updatedAt)}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/contents/${content.id}`}>
                            <ChevronRight className="mr-2 h-4 w-4" />
                            View
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/contents/${content.id}/edit`}>
                            <PenSquare className="mr-2 h-4 w-4" />
                            Edit
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          disabled={isDeleting === content.id}
                          className="text-destructive focus:text-destructive"
                          onClick={() => handleDelete(content.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          {isDeleting === content.id ? "Deleting..." : "Delete"}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-4">
                  No contents found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1}
              />
            </PaginationItem>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <PaginationItem key={p}>
                <PaginationLink
                  isActive={page === p}
                  onClick={() => handlePageChange(p)}
                >
                  {p}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext
                onClick={() => handlePageChange(page + 1)}
                disabled={page === totalPages}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}
