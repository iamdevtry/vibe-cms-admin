import './globals.css';
import { ReactNode } from 'react';
import Providers from './providers';
import { Toaster } from '@/components/ui/toaster';

export const metadata = {
  title: 'Vibe CMS',
  description: 'Admin Dashboard for Vibe',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
