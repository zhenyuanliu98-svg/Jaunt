import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import AppleProvider from "next-auth/providers/apple"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import { generateForwardingEmail } from "@/lib/utils"

const handler = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    AppleProvider({
      clientId: process.env.APPLE_ID!,
      clientSecret: process.env.APPLE_TEAM_ID!,
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      // Check if user exists, if not create with unique forwarding email
      if (!user.email) return false

      const existingUser = await prisma.user.findUnique({
        where: { email: user.email }
      })

      if (!existingUser) {
        await prisma.user.create({
          data: {
            email: user.email,
            name: user.name || '',
            authProvider: account?.provider || 'google',
            uniqueForwardEmail: generateForwardingEmail(),
          }
        })
      }

      return true
    },
    async session({ session, user }) {
      // Add user id to session
      if (session.user) {
        const dbUser = await prisma.user.findUnique({
          where: { email: session.user.email! }
        })
        if (dbUser) {
          session.user.id = dbUser.id
          session.user.forwardingEmail = dbUser.uniqueForwardEmail ?? undefined
        }
      }
      return session
    },
  },
  pages: {
    signIn: '/',
  },
  session: {
    strategy: "database",
  },
})

export { handler as GET, handler as POST }
