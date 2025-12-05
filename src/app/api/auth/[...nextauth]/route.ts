import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import AppleProvider from "next-auth/providers/apple"
import CredentialsProvider from "next-auth/providers/credentials"
import { SupabaseAdapter } from "@auth/supabase-adapter"
import { getSupabaseClient } from "@/lib/supabase"
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

async function getUserByEmail(email: string) {
  const supabase = getSupabaseClient()
  const { data } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single()

  return data
}

async function createUser(data: Record<string, any>) {
  const supabase = getSupabaseClient()
  const { data: newUser, error } = await supabase
    .from('users')
    .insert(data)
    .select()
    .single()

  if (error) throw error
  return newUser
}

async function updateUser(id: string, data: Record<string, any>) {
  const supabase = getSupabaseClient()
  const { data: updated, error } = await supabase
    .from('users')
    .update(data)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return updated
}

const handler = NextAuth({
  adapter: SupabaseAdapter({
    url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    secret: process.env.SUPABASE_SERVICE_ROLE_KEY!,
  }),
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

        const existingUser = await getUserByEmail(email)

        if (!existingUser) {
          const newUser = await createUser({
            email,
            passwordHash: hashPassword(password),
            name: "",
            authProvider: "credentials",
            uniqueForwardEmail: generateForwardingEmail(),
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

      const existingUser = await getUserByEmail(user.email)

      if (!existingUser) {
        await createUser({
          email: user.email,
          name: user.name || '',
          authProvider: account?.provider || 'credentials',
          uniqueForwardEmail: generateForwardingEmail(),
        })
      } else if (!existingUser.uniqueForwardEmail || !existingUser.authProvider) {
        await updateUser(existingUser.id, {
          uniqueForwardEmail: existingUser.uniqueForwardEmail || generateForwardingEmail(),
          authProvider: existingUser.authProvider || account?.provider || 'credentials',
        })
      }

      return true
    },
    async session({ session, user }) {
      // Add user id to session
      if (session.user) {
        const dbUser = await getUserByEmail(session.user.email!)
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
