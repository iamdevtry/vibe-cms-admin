export default function Sidebar() {
  return (
    <nav className="p-4">
      <ul>
        <li className="mb-2"><a href="/dashboard" className="hover:underline">Dashboard</a></li>
        <li className="mb-2"><a href="/dashboard/users" className="hover:underline">Users</a></li>
        <li className="mb-2"><a href="/dashboard/media" className="hover:underline">Media</a></li>
        <li className="mb-2"><a href="/dashboard/content" className="hover:underline">Content</a></li>
        <li className="mb-2"><a href="/dashboard/taxonomy" className="hover:underline">Taxonomy</a></li>
        <li className="mb-2"><a href="/dashboard/settings" className="hover:underline">Settings</a></li>
      </ul>
    </nav>
  );
}
