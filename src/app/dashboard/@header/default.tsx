'use client';

import { ReactNode } from 'react';
import { signOut, useSession } from 'next-auth/react';

export default function Header() {
  const { data: session } = useSession();
  return (
    <header className="flex items-center justify-between p-4 bg-white shadow">
      <h1 className="text-xl font-semibold">Dashboard</h1>
      <div className="flex items-center">
        {session?.user?.name && <span className="mr-4">{session.user.name}</span>}
        <button
          onClick={() => signOut()}
          className="text-blue-600 hover:underline"
        >
          Sign out
        </button>
      </div>
    </header>
  );
}
