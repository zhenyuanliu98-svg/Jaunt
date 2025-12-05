'use client'

import { signIn, useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Button from '@/components/ui/Button'

export default function Home() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (session) {
      router.push('/dashboard')
    }
  }, [session, router])

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center px-4">
        <h1 className="text-6xl font-bold text-gray-900 mb-4">
          Jaunt
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-md mx-auto">
          Your travel itinerary, beautifully organized
        </p>
        <div className="space-y-4">
          <div>
            <Button
              onClick={() => signIn('google', { callbackUrl: '/dashboard' })}
              className="bg-white text-gray-900 hover:bg-gray-50 px-8"
              size="lg"
            >
              Sign in with Google
            </Button>
          </div>
          <div>
            <Button
              onClick={() => signIn('apple', { callbackUrl: '/dashboard' })}
              className="bg-black text-white hover:bg-gray-900 px-8"
              size="lg"
            >
              Sign in with Apple
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
