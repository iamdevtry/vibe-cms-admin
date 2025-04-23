'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Sidebar() {
  const pathname = usePathname();
  
  const isActive = (path: string) => {
    return pathname === path || pathname?.startsWith(`${path}/`);
  };
  
  return (
    <nav className="p-4">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-white mb-4">Vibe CMS</h2>
      </div>
      
      <ul className="space-y-2">
        <li>
          <Link 
            href="/dashboard" 
            className={`block py-2 px-4 rounded transition-colors ${isActive('/dashboard') && pathname === '/dashboard' ? 'bg-green-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}
          >
            Dashboard
          </Link>
        </li>
        <li>
          <Link 
            href="/profile" 
            className={`block py-2 px-4 rounded transition-colors ${isActive('/profile') ? 'bg-green-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}
          >
            My Profile
          </Link>
        </li>
        
        <li className="pt-4 pb-1">
          <div className="text-xs uppercase text-gray-500 font-semibold px-4">Content Management</div>
        </li>
        <li>
          <Link 
            href="/users" 
            className={`block py-2 px-4 rounded transition-colors ${isActive('/users') ? 'bg-green-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}
          >
            Users
          </Link>
        </li>
        <li>
          <Link 
            href="/media" 
            className={`block py-2 px-4 rounded transition-colors ${isActive('/media') ? 'bg-green-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}
          >
            Media
          </Link>
        </li>
        <li>
          <Link 
            href="/content" 
            className={`block py-2 px-4 rounded transition-colors ${isActive('/content') ? 'bg-green-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}
          >
            Content
          </Link>
        </li>
        <li>
          <Link 
            href="/taxonomy" 
            className={`block py-2 px-4 rounded transition-colors ${isActive('/taxonomy') ? 'bg-green-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}
          >
            Taxonomy
          </Link>
        </li>
        
        <li className="pt-4 pb-1">
          <div className="text-xs uppercase text-gray-500 font-semibold px-4">Administration</div>
        </li>
        <li>
          <Link 
            href="/settings" 
            className={`block py-2 px-4 rounded transition-colors ${isActive('/settings') ? 'bg-green-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}
          >
            Settings
          </Link>
        </li>
      </ul>
    </nav>
  );
}
