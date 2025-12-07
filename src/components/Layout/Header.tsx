'use client'

import { signOut, useSession } from 'next-auth/react'
import Link from 'next/link'
import Button from '@/components/ui/Button'
import { LogOut, Plane } from 'lucide-react'

export default function Header() {
  const { data: session } = useSession()

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/dashboard" className="flex items-center space-x-2">
            <Plane className="h-6 w-6 text-indigo-600" />
            <span className="text-xl font-bold text-gray-900">Jaunt</span>
          </Link>

          <nav className="flex items-center space-x-4">
            {session && (
              <>
                <span className="text-sm text-gray-600">
                  {session.user?.name || session.user?.email}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => signOut({ callbackUrl: '/' })}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  )
}
