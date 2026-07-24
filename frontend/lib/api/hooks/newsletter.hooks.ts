import { useMutation } from '@tanstack/react-query'
import { api } from '../instance'

export function useSubscribeNewsletter() {
  return useMutation({
    mutationFn: (email: string) =>
      api.post<{ message: string }>('/newsletter/subscribe', { email }, { silent: true }),
  })
}

export function useUnsubscribeNewsletter() {
  return useMutation({
    mutationFn: (token: string) =>
      api.post<{ message: string }>('/newsletter/unsubscribe', { token }, { silent: true }),
  })
}
