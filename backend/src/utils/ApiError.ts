export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly errors: any;

  constructor(statusCode: number, message: string, errors: any = null) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    
    // Maintain proper stack trace (only available on V8 engines like Node)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}
export default ApiError;
