import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import AppleProvider from "next-auth/providers/apple"
import CredentialsProvider from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import { generateForwardingEmail } from "@/lib/utils"
import { randomBytes, scryptSync, timingSafeEqual } from "crypto"

const hashPassword = (password: string) => {
  const salt = randomBytes(16).toString("hex")
  const hash = scryptSync(password, salt, 64).toString("hex")
  return `${salt}:${hash}`
}

const verifyPassword = (password: string, storedHash: string) => {
  const [salt, hash] = storedHash.split(":")

  if (!salt || !hash) return false

  const derivedHash = scryptSync(password, salt, 64)
  const storedBuffer = Buffer.from(hash, "hex")

  if (derivedHash.length !== storedBuffer.length) return false

  return timingSafeEqual(derivedHash, storedBuffer)
}

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
    CredentialsProvider({
      name: "Email and Password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Please provide both email and password")
        }

        const email = credentials.email.toLowerCase().trim()
        const password = credentials.password

        if (password.length < 8) {
          throw new Error("Password must be at least 8 characters long")
        }

        const existingUser = await prisma.user.findUnique({
          where: { email },
        })

        if (!existingUser) {
          const newUser = await prisma.user.create({
            data: {
              email,
              passwordHash: hashPassword(password),
              name: "",
              authProvider: "credentials",
              uniqueForwardEmail: generateForwardingEmail(),
            },
          })

          return newUser
        }

        if (!existingUser.passwordHash) {
          throw new Error("Please continue with your existing sign-in method")
        }

        const isValidPassword = verifyPassword(password, existingUser.passwordHash)

        if (!isValidPassword) {
          throw new Error("Invalid email or password")
        }

        return existingUser
      },
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
            authProvider: account?.provider || 'credentials',
            uniqueForwardEmail: generateForwardingEmail(),
          }
        })
      } else if (!existingUser.uniqueForwardEmail || !existingUser.authProvider) {
        await prisma.user.update({
          where: { id: existingUser.id },
          data: {
            uniqueForwardEmail: existingUser.uniqueForwardEmail || generateForwardingEmail(),
            authProvider: existingUser.authProvider || account?.provider || 'credentials',
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
