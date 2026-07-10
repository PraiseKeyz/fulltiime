import { toast } from 'sonner'
import { ApiError, NetworkError } from './errors'
import { friendlyMessage } from './messages'
import type {
  ApiEnvelope,
  RequestConfig,
  RequestInterceptorFn,
  ResponseInterceptorFn,
  ErrorInterceptorFn,
} from './types'


const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000/api/v1'
const DEFAULT_TIMEOUT_MS = 15_000

export class ApiClient {
  private readonly requestInterceptors: RequestInterceptorFn[] = []
  private readonly responseInterceptors: ResponseInterceptorFn[] = []
  private readonly errorInterceptors: ErrorInterceptorFn[] = []

  // Holds the in-flight /auth/refresh call, if any (see tryRefresh).
  private refreshInFlight: Promise<boolean> | null = null

  addRequestInterceptor(fn: RequestInterceptorFn): this {
    this.requestInterceptors.push(fn)
    return this
  }

  addResponseInterceptor(fn: ResponseInterceptorFn): this {
    this.responseInterceptors.push(fn)
    return this
  }

  addErrorInterceptor(fn: ErrorInterceptorFn): this {
    this.errorInterceptors.push(fn)
    return this
  }

  private buildUrl(
    endpoint: string,
    params?: Record<string, string | number | boolean>,
  ): string {
    const url = new URL(`${BASE_URL}${endpoint}`)
    if (params) {
      Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, String(v)))
    }
    return url.toString()
  }

  private handleError(error: ApiError | NetworkError, silent: boolean) {
    this.errorInterceptors.forEach((fn) => fn(error))
    if (!silent) toast.error(error.message)
  }

  private tryRefresh(): Promise<boolean> {
    if (!this.refreshInFlight) {
      this.refreshInFlight = fetch(this.buildUrl('/auth/refresh'), {
        method:      'POST',
        credentials: 'include',
        headers:     { 'Content-Type': 'application/json' },
      })
        .then((res) => res.ok)
        .catch(() => false)
        .finally(() => { this.refreshInFlight = null })
    }
    return this.refreshInFlight
  }

  async request<T = unknown>(endpoint: string, config: RequestConfig = {}, attemptRefresh = true): Promise<T> {
    const {
      body,
      params,
      timeout = DEFAULT_TIMEOUT_MS,
      silent = false,
      successMessage,
      skipAuthRedirect = false,
      headers,
      ...restInit
    } = config

    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), timeout)

    // FormData bodies (file uploads) must not be JSON-stringified, and the
    // browser must set the multipart boundary header itself.
    const isFormData = typeof FormData !== 'undefined' && body instanceof FormData

    let interceptedConfig: RequestConfig & { url: string } = {
      url: this.buildUrl(endpoint, params),
      body,
      headers: isFormData
        ? { ...(headers ?? {}) }
        : { 'Content-Type': 'application/json', ...(headers ?? {}) },
      credentials: 'include',
      ...restInit,
    }

    for (const interceptor of this.requestInterceptors) {
      interceptedConfig = interceptor(interceptedConfig)
    }

    const { url, body: reqBody, ...fetchInit } = interceptedConfig

    try {
      const response = await fetch(url, {
        ...fetchInit,
        signal: controller.signal,
        body:
          reqBody === undefined
            ? undefined
            : isFormData
              ? (reqBody as FormData)
              : JSON.stringify(reqBody),
      })

      clearTimeout(timer)

      if (!response.ok) {
        const payload = await response.json().catch(() => null)
        const message = (payload?.message as string | undefined) ?? friendlyMessage(response.status)
        const error = new ApiError(response.status, message, payload)

        if (response.status === 401) {
          const isAuthRoute =
            endpoint.startsWith('/auth/login') ||
            endpoint.startsWith('/auth/register') ||
            endpoint.startsWith('/auth/refresh')

          if (attemptRefresh && !isAuthRoute && (await this.tryRefresh())) {
            return this.request<T>(endpoint, config, false)
          }

          this.handleError(error, silent)
          if (!skipAuthRedirect) {
            const publicPaths = ['/', '/login', '/register']
            const onPublicPage =
              typeof window !== 'undefined' &&
              publicPaths.some(
                (p) => window.location.pathname === p || window.location.pathname.startsWith(p + '/'),
              )
            if (!onPublicPage && typeof window !== 'undefined') {
              window.location.href = '/login'
            }
          }
          throw error
        }

        this.handleError(error, silent)
        throw error
      }

      if (response.status === 204) {
        if (successMessage && !silent) toast.success(successMessage)
        return null as T
      }

      const envelope: ApiEnvelope<T> = await response.json()

      let processed = envelope
      for (const interceptor of this.responseInterceptors) {
        processed = interceptor(processed) as ApiEnvelope<T>
      }

      if (successMessage && !silent) toast.success(successMessage)

      return (processed.data ?? processed) as T
    } catch (err) {
      clearTimeout(timer)

      if (err instanceof ApiError) throw err

      const isTimeout = err instanceof Error && err.name === 'AbortError'
      const networkError = new NetworkError(
        isTimeout
          ? 'Request timed out. Please try again.'
          : 'Unable to reach the server. Check your internet connection.',
      )

      this.handleError(networkError, silent)
      throw networkError
    }
  }

  get<T = unknown>(endpoint: string, config?: RequestConfig) {
    return this.request<T>(endpoint, { ...config, method: 'GET' })
  }

  post<T = unknown>(endpoint: string, body?: unknown, config?: RequestConfig) {
    return this.request<T>(endpoint, { ...config, method: 'POST', body })
  }

  put<T = unknown>(endpoint: string, body?: unknown, config?: RequestConfig) {
    return this.request<T>(endpoint, { ...config, method: 'PUT', body })
  }

  patch<T = unknown>(endpoint: string, body?: unknown, config?: RequestConfig) {
    return this.request<T>(endpoint, { ...config, method: 'PATCH', body })
  }

  delete<T = unknown>(endpoint: string, config?: RequestConfig) {
    return this.request<T>(endpoint, { ...config, method: 'DELETE' })
  }
}
