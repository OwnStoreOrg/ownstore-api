class AppError extends Error {
  public status: number

  public message: string

  public code?: string

  public data?: any

  public readonly isAppError: boolean

  public constructor(status: number, message: string, code?: string, data?: any) {
    super()
    this.status = status
    this.message = message
    this.code = code
    this.data = data
    this.isAppError = true
  }

  public static isAppError(err: Error): boolean {
    if (err instanceof Error) {
      return !!(err as AppError).isAppError
    }
    return false
  }
}

export default AppError
