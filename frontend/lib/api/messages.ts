const HTTP_MESSAGES: Record<number, string> = {
  400: 'Invalid request. Please check your input.',
  401: 'Your session has expired. Please log in again.',
  403: "You don't have permission to do that.",
  404: 'The requested resource was not found.',
  409: 'A conflict occurred. This may already exist.',
  422: 'The provided data is invalid.',
  429: 'Too many requests. Please wait a moment and try again.',
  500: 'Something went wrong on our end. Please try again.',
  502: 'The service is temporarily unavailable.',
  503: 'The service is temporarily unavailable.',
}

export function friendlyMessage(status: number): string {
  return HTTP_MESSAGES[status] ?? 'An unexpected error occurred.'
}
