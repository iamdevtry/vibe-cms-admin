"use client";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ToastTest } from "@/components/toast-test";

export default function DashboardPage() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Toast Testing</CardTitle>
            <CardDescription>Test the toast notification system</CardDescription>
          </CardHeader>
          <CardContent>
            <ToastTest />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Content Types</CardTitle>
            <CardDescription>Manage your content type definitions</CardDescription>
          </CardHeader>
          <CardContent>
            <p>You currently have content type definitions in the system.</p>
          </CardContent>
          <CardFooter>
            <a href="/content-types" className="text-blue-600 hover:underline">View Content Types</a>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Contents</CardTitle>
            <CardDescription>Manage your content entries</CardDescription>
          </CardHeader>
          <CardContent>
            <p>You currently have content entries in the system.</p>
          </CardContent>
          <CardFooter>
            <a href="/contents" className="text-blue-600 hover:underline">View Contents</a>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
