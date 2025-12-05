'use client'

import { signIn, useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { FormEvent, useEffect, useState } from 'react'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

export default function Home() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (session) {
      router.push('/dashboard')
    }
  }, [session, router])

  const handleEmailSignIn = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')

    if (!email || !password) {
      setError('Please enter your email and password')
      return
    }

    setIsSubmitting(true)
    const result = await signIn('credentials', { email, password, redirect: false, callbackUrl: '/dashboard' })

    if (result?.error) {
      setError(result.error ?? 'Unable to sign in. Please try again.')
    } else if (result?.url) {
      router.push(result.url)
    }

    setIsSubmitting(false)
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="w-full max-w-4xl px-4 py-12 grid gap-8 lg:grid-cols-2 items-center">
        <div className="text-center lg:text-left space-y-4">
          <h1 className="text-5xl lg:text-6xl font-bold text-gray-900">
            Jaunt
          </h1>
          <p className="text-lg lg:text-xl text-gray-600 max-w-md mx-auto lg:mx-0">
            Your travel itinerary, beautifully organized
          </p>
        </div>
        <div className="bg-white shadow-xl rounded-2xl p-6 space-y-6">
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold text-gray-900">Sign in</h2>
            <p className="text-gray-600 text-sm">
              Enter your email and create a password to sign in or register.
            </p>
          </div>
          <form onSubmit={handleEmailSignIn} className="space-y-3">
            <Input
              type="email"
              label="Email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              type="password"
              label="Password"
              placeholder="Create a password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
            />
            <Button
              type="submit"
              size="lg"
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Signing in...' : 'Continue with email'}
            </Button>
            {error && <p className="text-sm text-red-600">{error}</p>}
          </form>
          <div className="flex items-center gap-2">
            <div className="h-px flex-1 bg-gray-200" />
            <span className="text-xs uppercase tracking-widest text-gray-400">or</span>
            <div className="h-px flex-1 bg-gray-200" />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Button
              onClick={() => signIn('google', { callbackUrl: '/dashboard' })}
              className="bg-white text-gray-900 hover:bg-gray-50 border border-gray-200"
              size="lg"
            >
              Sign in with Google
            </Button>
            <Button
              onClick={() => signIn('apple', { callbackUrl: '/dashboard' })}
              className="bg-black text-white hover:bg-gray-900"
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
