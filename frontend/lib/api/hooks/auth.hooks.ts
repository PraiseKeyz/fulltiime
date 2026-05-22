import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '../instance'
import type { AuthResponse, User } from '../domain'

export const authKeys = {
  me: ['auth', 'me'] as const,
}

export function useMe() {
  return useQuery({
    queryKey: authKeys.me,
    queryFn: () => api.get<User>('/auth/me'),
    retry: false,
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

export function useLogout() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async () => {
      qc.setQueryData(authKeys.me, null)
      qc.clear()
    },
  })
}
