import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '../instance'
import type { AuthResponse, User } from '../domain'

export const authKeys = {
  me: ['auth', 'me'] as const,
}

export function useMe() {
  return useQuery({
    queryKey: authKeys.me,
    // Guests are expected to 401 here — fail quietly and never redirect.
    queryFn: () => api.get<User>('/auth/me', { silent: true, skipAuthRedirect: true }),
    retry: false,
    staleTime: 5 * 60 * 1000,
  })
}

export function useRegister() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: { email: string; username: string; password: string; full_name: string }) =>
      api.post<AuthResponse>('/auth/register', body, { successMessage: 'Account created!' }),
    onSuccess: (data) => {
      qc.setQueryData(authKeys.me, data.user)
    },
  })
}

export function useLogin() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: { identifier: string; password: string }) =>
      api.post<AuthResponse>('/auth/login', body, { successMessage: 'Welcome back!' }),
    onSuccess: (data) => {
      qc.setQueryData(authKeys.me, data.user)
    },
  })
}

export function useGoogleLogin() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (credential: string) =>
      api.post<AuthResponse>('/auth/google', { credential }, { successMessage: 'Welcome back!' }),
    onSuccess: (data) => {
      qc.setQueryData(authKeys.me, data.user)
    },
  })
}

export function useLogout() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => api.post('/auth/logout', undefined, { silent: true }).catch(() => null),
    onSettled: () => {
      qc.setQueryData(authKeys.me, null)
      qc.clear()
    },
  })
}

// ── Email verification ──────────────────────────────────────────────────────────

export function useVerifyEmail() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (token: string) =>
      api.post<AuthResponse>('/auth/verify-email', { token }, { silent: true }),
    onSuccess: () => {
      // If they happen to be logged in, refresh their is_verified flag.
      qc.invalidateQueries({ queryKey: authKeys.me })
    },
  })
}

export function useResendVerification() {
  return useMutation({
    mutationFn: (email: string) =>
      api.post('/auth/resend-verification', { email }, { silent: true }),
  })
}

// ── Password reset ────────────────────────────────────────────────────────────────

export function useForgotPassword() {
  return useMutation({
    mutationFn: (email: string) =>
      api.post('/auth/forgot-password', { email }, { silent: true }),
  })
}

export function useResetPassword() {
  return useMutation({
    mutationFn: (body: { token: string; password: string }) =>
      api.post('/auth/reset-password', body, { silent: true }),
  })
}
