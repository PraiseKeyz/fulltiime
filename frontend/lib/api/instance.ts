import { ApiClient } from './client'

export const api = new ApiClient()
  .addRequestInterceptor((config) => {
    return config
  })
  .addResponseInterceptor((envelope) => {
    return envelope
  })
  .addErrorInterceptor((_error) => {
  })
