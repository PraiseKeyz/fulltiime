export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly payload?: unknown,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export class NetworkError extends Error {
  constructor(message = 'Unable to reach the server. Check your internet connection.') {
    super(message)
    this.name = 'NetworkError'
  }
}
