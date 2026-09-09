import { NextResponse } from 'next/server';

/**
 * An expected API error with a safe message and HTTP status.
 */
export class ApiError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

type PostgreSqlError = {
  code?: string;
};

/**
 * Convert errors into safe HTTP responses.
 */
export function handleError(err: unknown): NextResponse {
  // Errors deliberately thrown by our validation code.
  if (err instanceof ApiError) {
    return NextResponse.json(
      { error: err.message },
      { status: err.status }
    );
  }

  // request.json() throws SyntaxError when the body contains malformed JSON.
  if (err instanceof SyntaxError) {
    return NextResponse.json(
      { error: 'Request body must contain valid JSON' },
      { status: 400 }
    );
  }

  const databaseError = err as PostgreSqlError;

  // PostgreSQL code 23505 means a unique value already exists.
  if (databaseError?.code === '23505') {
    return NextResponse.json(
      { error: 'Restaurant conflicts with an existing record' },
      { status: 409 }
    );
  }

  // Log internal details on the server, but do not send them to the client.
  console.error('Unhandled API error:', err);

  return NextResponse.json(
    { error: 'Internal Server Error' },
    { status: 500 }
  );
}
