"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ContentType } from "@prisma/client";
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
import { getContentTypes, deleteContentType } from "@/lib/services/content.service";
import { formatDate } from "@/lib/utils/format";
import { useToast } from "@/components/ui/use-toast";

export default function ContentTypesPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [contentTypes, setContentTypes] = useState<ContentType[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  // Load content types on initial render
  useEffect(() => {
    loadContentTypes();
  }, []);

  // Function to load content types
  const loadContentTypes = async () => {
    setIsLoading(true);
    try {
      const result = await getContentTypes({
        page,
        limit,
        search: search || undefined,
      });
      setContentTypes(result.data);
      setTotalPages(result.pagination.totalPages);
    } catch (error) {
      console.error("Error loading content types:", error);
      toast({
        title: "Error",
        description: "Failed to load content types",
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

  // Handle search form submit
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadContentTypes();
  };

  // Handle pagination
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    loadContentTypes();
  };

  // Handle delete content type
  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this content type?")) {
      setIsDeleting(id);
      try {
        await deleteContentType(id);
        toast({
          title: "Success",
          description: "Content type deleted successfully",
        });
        loadContentTypes();
      } catch (error) {
        console.error("Error deleting content type:", error);
        toast({
          title: "Error",
          description: "Failed to delete content type",
          variant: "destructive",
        });
      } finally {
        setIsDeleting(null);
      }
    }
  };

  return (
    <div className="container py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Content Types</h1>
        <Button asChild>
          <Link href="/content-types/create">
            <Plus className="mr-2 h-4 w-4" />
            Create Content Type
          </Link>
        </Button>
      </div>

      <div className="flex items-center space-x-2">
        <form onSubmit={handleSearchSubmit} className="flex-1 flex space-x-2">
          <Input
            placeholder="Search content types..."
            value={search}
            onChange={handleSearchChange}
            className="max-w-sm"
          />
          <Button type="submit" variant="secondary">
            Search
          </Button>
        </form>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableCaption>List of content types in your CMS</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>System</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Updated</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-4">
                  Loading...
                </TableCell>
              </TableRow>
            ) : contentTypes.length > 0 ? (
              contentTypes.map((contentType) => (
                <TableRow key={contentType.id}>
                  <TableCell className="font-medium">{contentType.name}</TableCell>
                  <TableCell>{contentType.slug}</TableCell>
                  <TableCell className="max-w-xs truncate">
                    {contentType.description}
                  </TableCell>
                  <TableCell>
                    {contentType.isSystem ? "Yes" : "No"}
                  </TableCell>
                  <TableCell>{formatDate(contentType.createdAt)}</TableCell>
                  <TableCell>{formatDate(contentType.updatedAt)}</TableCell>
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
                          <Link href={`/content-types/${contentType.id}`}>
                            <ChevronRight className="mr-2 h-4 w-4" />
                            View
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/content-types/${contentType.id}/edit`}>
                            <PenSquare className="mr-2 h-4 w-4" />
                            Edit
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          disabled={contentType.isSystem || isDeleting === contentType.id}
                          className="text-destructive focus:text-destructive"
                          onClick={() => handleDelete(contentType.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          {isDeleting === contentType.id ? "Deleting..." : "Delete"}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-4">
                  No content types found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
{/* 
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
      )} */}
    </div>
  );
}
