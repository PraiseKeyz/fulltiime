import { ApiClient } from './client'

export const api = new ApiClient()
  .addRequestInterceptor((config) => {
    // Attach global request headers here (e.g. correlation IDs, feature flags)
    return config
  })
  .addResponseInterceptor((envelope) => {
    // Global response transforms go here (e.g. date parsing)
    return envelope
  })
  .addErrorInterceptor((_error) => {
    // Wire external error reporters here (e.g. Sentry.captureException(_error))
  })
