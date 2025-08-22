/**
 * Custom error class for payment flow errors
 * Ensures proper serialization and consistent error handling
 */
export class PaymentFlowError extends Error {
  public readonly type: string
  public readonly details?: any
  public readonly timestamp: number

  constructor(
    message: string,
    type: string = 'PaymentFlowError',
    details?: any
  ) {
    super(message)
    this.name = this.constructor.name
    this.type = type
    this.details = details
    this.timestamp = Date.now()
    
    // Ensure proper stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, PaymentFlowError)
    }
    
    // Ensure the message property is properly set
    this.message = message
  }

  toJSON() {
    return {
      name: this.name,
      type: this.type,
      message: this.message,
      details: this.details,
      timestamp: this.timestamp,
      stack: this.stack
    }
  }

  toString() {
    return `${this.name} [${this.type}]: ${this.message}`
  }
}

/**
 * Specific error types for different scenarios
 */
export class ValidationError extends PaymentFlowError {
  constructor(message: string, details?: any) {
    super(message, 'ValidationError', details)
  }
}

export class BookingError extends PaymentFlowError {
  constructor(message: string, details?: any) {
    super(message, 'BookingError', details)
  }
}

export class PaymentError extends PaymentFlowError {
  constructor(message: string, details?: any) {
    super(message, 'PaymentError', details)
  }
}

export class FunctionError extends PaymentFlowError {
  constructor(message: string, details?: any) {
    super(message, 'FunctionError', details)
  }
}

/**
 * Utility function to safely create error objects
 */
export function createSafeError(
  message: string,
  type: string = 'PaymentFlowError',
  details?: any
): PaymentFlowError {
  return new PaymentFlowError(message, type, details)
}

/**
 * Utility function to safely handle unknown errors
 */
export function handleUnknownError(error: unknown): PaymentFlowError {
  if (error instanceof PaymentFlowError) {
    return error
  }
  
  if (error instanceof Error) {
    return new PaymentFlowError(error.message, 'WrappedError', {
      originalName: error.name,
      originalStack: error.stack
    })
  }
  
  if (typeof error === 'string') {
    return new PaymentFlowError(error, 'StringError')
  }
  
  if (error && typeof error === 'object') {
    try {
      return new PaymentFlowError(
        JSON.stringify(error),
        'ObjectError',
        error
      )
    } catch {
      return new PaymentFlowError('Unknown object error', 'ObjectError')
    }
  }
  
  return new PaymentFlowError('Unknown error', 'UnknownError')
}