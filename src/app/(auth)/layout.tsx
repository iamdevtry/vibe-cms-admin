import React from 'react';
import { Metadata } from 'next';
import '../globals.css';

export const metadata: Metadata = {
  title: 'Authentication - Vibe CMS',
  description: 'Secure authentication for Vibe CMS',
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen bg-gradient-to-b from-green-50 to-gray-100">
          <div className="container mx-auto p-4">
            <header className="py-6 flex justify-center">
              <div className="text-center">
                <h1 className="text-3xl font-bold text-green-800">Vibe CMS</h1>
                <p className="text-gray-600">Content Management System</p>
              </div>
            </header>
            <main>
              {children}
            </main>
            <footer className="mt-16 text-center text-sm text-gray-500 py-4">
              <p>© {new Date().getFullYear()} Vibe CMS. All rights reserved.</p>
            </footer>
          </div>
        </div>
      </body>
    </html>
  );
}
