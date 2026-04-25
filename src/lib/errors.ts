/**
 * Custom Error Classes for API
 */

export class ApiError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    this.name = "ApiError";
  }
}

export class ValidationError extends ApiError {
  constructor(message: string) {
    super(message, 400);
    this.name = "ValidationError";
  }
}

export class UnauthorizedError extends ApiError {
  constructor(message: string = "Unauthorized") {
    super(message, 401);
    this.name = "UnauthorizedError";
  }
}

export class ForbiddenError extends ApiError {
  constructor(message: string = "Forbidden") {
    super(message, 403);
    this.name = "ForbiddenError";
  }
}

export class NotFoundError extends ApiError {
  constructor(message: string = "Resource not found") {
    super(message, 404);
    this.name = "NotFoundError";
  }
}

export class ConflictError extends ApiError {
  constructor(message: string = "Resource already exists") {
    super(message, 409);
    this.name = "ConflictError";
  }
}

/**
 * Error handler utility for API routes
 */
export function handleApiError(error: unknown): Response {
  console.error("API Error:", error);

  if (error instanceof ApiError) {
    return Response.json(
      { error: error.message },
      { status: error.statusCode },
    );
  }

  if (error instanceof Error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json(
    { error: "An unexpected error occurred" },
    { status: 500 },
  );
}

/**
 * Validation helper
 */
export function validateRequired(
  data: Record<string, any>,
  requiredFields: string[],
): void {
  const missingFields = requiredFields.filter((field) => !data[field]);

  if (missingFields.length > 0) {
    throw new ValidationError(
      `Missing required fields: ${missingFields.join(", ")}`,
    );
  }
}
