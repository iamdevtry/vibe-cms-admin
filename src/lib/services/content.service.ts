import { ContentFormData, ContentTypeFormData } from "@/types/content.types";

// Content Types API
export async function getContentTypes(options?: {
  page?: number;
  limit?: number;
  search?: string;
}) {
  const queryParams = new URLSearchParams();
  
  if (options?.page) queryParams.append("page", options.page.toString());
  if (options?.limit) queryParams.append("limit", options.limit.toString());
  if (options?.search) queryParams.append("search", options.search);
  
  const response = await fetch(`/api/content-types?${queryParams.toString()}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  
  if (!response.ok) {
    throw new Error("Failed to fetch content types");
  }
  
  return response.json();
}

export async function getContentType(id: string) {
  const response = await fetch(`/api/content-types/${id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  
  if (!response.ok) {
    throw new Error("Failed to fetch content type");
  }
  
  return response.json();
}

export async function createContentType(data: ContentTypeFormData) {
  const response = await fetch("/api/content-types", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to create content type");
  }
  
  return response.json();
}

export async function updateContentType(id: string, data: Partial<ContentTypeFormData>) {
  const response = await fetch(`/api/content-types/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to update content type");
  }
  
  return response.json();
}

export async function deleteContentType(id: string) {
  const response = await fetch(`/api/content-types/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to delete content type");
  }
  
  return true;
}

// Contents API
export async function getContents(options?: {
  page?: number;
  limit?: number;
  search?: string;
  contentTypeId?: string;
  status?: string;
  authorId?: string;
}) {
  const queryParams = new URLSearchParams();
  
  if (options?.page) queryParams.append("page", options.page.toString());
  if (options?.limit) queryParams.append("limit", options.limit.toString());
  if (options?.search) queryParams.append("search", options.search);
  if (options?.contentTypeId) queryParams.append("contentTypeId", options.contentTypeId);
  if (options?.status) queryParams.append("status", options.status);
  if (options?.authorId) queryParams.append("authorId", options.authorId);
  
  const response = await fetch(`/api/contents?${queryParams.toString()}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  
  if (!response.ok) {
    throw new Error("Failed to fetch contents");
  }
  
  return response.json();
}

export async function getContent(id: string) {
  const response = await fetch(`/api/contents/${id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  
  if (!response.ok) {
    throw new Error("Failed to fetch content");
  }
  
  return response.json();
}

export async function createContent(data: ContentFormData) {
  const response = await fetch("/api/contents", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to create content");
  }
  
  return response.json();
}

export async function updateContent(id: string, data: Partial<ContentFormData>) {
  const response = await fetch(`/api/contents/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to update content");
  }
  
  return response.json();
}

export async function deleteContent(id: string) {
  const response = await fetch(`/api/contents/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to delete content");
  }
  
  return true;
}
