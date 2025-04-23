import { ReactNode } from 'react';

export const metadata = {
  title: 'Dashboard – Vibe CMS',
  description: 'Admin dashboard layout',
};

export default function DashboardLayout({
  children,
  sidebar,
  header,
}: {
  children: ReactNode;
  sidebar: ReactNode;
  header: ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden">
      <div className="w-64 bg-gray-800 text-white">
        {sidebar}
      </div>
      <div className="flex-1 flex flex-col">
        {header}
        <main className="flex-1 p-6 bg-gray-100 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
