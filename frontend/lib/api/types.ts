import type { ApiError, NetworkError } from './errors'

export interface ApiEnvelope<T = unknown> {
  success: boolean
  statusCode: number
  data: T
  message?: string
  timestamp?: string
}

export interface RequestConfig extends Omit<RequestInit, 'body' | 'signal'> {
  body?: unknown
  params?: Record<string, string | number | boolean>
  timeout?: number
  silent?: boolean
  successMessage?: string
}

export type RequestInterceptorFn = (
  config: RequestConfig & { url: string },
) => RequestConfig & { url: string }

export type ResponseInterceptorFn = <T>(envelope: ApiEnvelope<T>) => ApiEnvelope<T>

export type ErrorInterceptorFn = (error: ApiError | NetworkError) => void
