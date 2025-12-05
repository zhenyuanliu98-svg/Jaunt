import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"

export async function requireAuth() {
  const session = await getServerSession()

  if (!session || !session.user) {
    redirect('/')
  }

  return session
}

export async function getSession() {
  return await getServerSession()
}
