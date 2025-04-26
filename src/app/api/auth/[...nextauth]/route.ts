import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';

// Export the NextAuth handler with the separated auth options
const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
