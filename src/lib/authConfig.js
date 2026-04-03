import GoogleProvider from 'next-auth/providers/google'
import { USERS } from './roleConfig'

function getUserByEmail(email) {
  if (!email) return null
  return USERS.find(u => u.email?.toLowerCase() === email.toLowerCase()) || null
}

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_OAUTH_CLIENT_ID,
      clientSecret: process.env.GOOGLE_OAUTH_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    // Only allow sign-in if the email is in the authorised list
    async signIn({ profile }) {
      const user = getUserByEmail(profile?.email)
      if (!user) return '/no-access'
      return true
    },
    // Store the gecko user object inside the JWT token
    async jwt({ token, profile }) {
      if (profile?.email) {
        const user = getUserByEmail(profile.email)
        if (user) token.geckoUser = user
      }
      return token
    },
    // Expose geckoUser on the session so the client can read it
    async session({ session, token }) {
      session.geckoUser = token.geckoUser || null
      return session
    },
  },
  pages: {
    signIn: '/login',
  },
  session: { strategy: 'jwt' },
}
