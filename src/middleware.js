import { withAuth } from 'next-auth/middleware'

// Protect all routes except /login, /no-access, and NextAuth internals
export default withAuth({
  pages: { signIn: '/login' },
})

export const config = {
  matcher: ['/((?!api/auth|login|no-access|_next/static|_next/image|favicon.ico).*)'],
}
