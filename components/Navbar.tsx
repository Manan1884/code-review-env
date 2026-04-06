'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';

export default function Navbar() {
  const { data: session } = useSession();

  return (
    <nav className="border-b border-[#1f1f1f] bg-[#0d0d0d]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Link href="/" className="font-heading text-xl font-bold text-[#00ff88]">
              OpenEnv
            </Link>
            <div className="hidden md:flex items-center gap-6">
              <Link href="/" className="text-sm text-gray-300 hover:text-white transition-colors">
                Home
              </Link>
              <Link href="/prs" className="text-sm text-gray-300 hover:text-white transition-colors">
                PRs
              </Link>
              <Link href="/leaderboard" className="text-sm text-gray-300 hover:text-white transition-colors">
                Leaderboard
              </Link>
              {session?.user && (
                <>
                  <Link href="/submit" className="text-sm text-gray-300 hover:text-white transition-colors">
                    Submit
                  </Link>
                  <Link href="/dashboard" className="text-sm text-gray-300 hover:text-white transition-colors">
                    Dashboard
                  </Link>
                </>
              )}
              {session?.user?.role === 'admin' && (
                <Link href="/admin" className="text-sm text-[#00ff88] hover:text-[#00ff88]/80 transition-colors">
                  Admin
                </Link>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4">
            {session?.user ? (
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-400 hidden sm:block">
                  {session.user.name}
                </span>
                <button
                  onClick={() => signOut()}
                  className="px-4 py-2 text-sm font-medium text-white bg-[#1f1f1f] rounded-lg hover:bg-[#2f2f2f] transition-colors"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <Link
                href="/auth"
                className="px-4 py-2 text-sm font-medium text-[#0d0d0d] bg-[#00ff88] rounded-lg hover:bg-[#00ff88]/90 transition-colors"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
