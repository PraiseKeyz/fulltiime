'use client'

import { createContext, useContext } from 'react'
import { useMe, useLogout } from '@/lib/api/hooks/auth.hooks'
import type { User } from '@/lib/api/domain'

interface AuthContextValue {
  user: User | null
  /** True only while the initial /auth/me check is in flight. */
  isLoading: boolean
  isAuthenticated: boolean
  /** Re-run the /auth/me check (e.g. after verifying email). */
  refetch: () => void
  /** Log out: clears server cookies + local cache. */
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data, isLoading, refetch } = useMe()
  const { mutate: logout } = useLogout()
  const user = data ?? null

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        refetch: () => void refetch(),
        logout: () => logout(),
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an <AuthProvider>')
  return ctx
}
