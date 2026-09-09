import { ApiError } from '@/lib/errors';

export interface VisitInput {
  restaurantId: number;
  date: string;
  amountSpent: number | null;
  notes: string | null;
}

function isRealDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const date = new Date(`${value}T00:00:00Z`);

  return (
    !Number.isNaN(date.getTime()) &&
    date.toISOString().slice(0, 10) === value
  );
}

export function validateVisitInput(body: unknown): VisitInput {
  if (
    typeof body !== 'object' ||
    body === null ||
    Array.isArray(body)
  ) {
    throw new ApiError(400, 'Request body must be a JSON object');
  }

  const value = body as Record<string, unknown>;

  if (
    typeof value.restaurantId !== 'number' ||
    !Number.isSafeInteger(value.restaurantId) ||
    value.restaurantId <= 0
  ) {
    throw new ApiError(
      400,
      'restaurantId must be a positive integer'
    );
  }

  if (typeof value.date !== 'string' || !isRealDate(value.date)) {
    throw new ApiError(
      400,
      'date must be a real date in YYYY-MM-DD format'
    );
  }

  if (
    value.amountSpent !== undefined &&
    value.amountSpent !== null &&
    (
      typeof value.amountSpent !== 'number' ||
      !Number.isFinite(value.amountSpent) ||
      value.amountSpent < 0
    )
  ) {
    throw new ApiError(
      400,
      'amountSpent must be a non-negative number or null'
    );
  }

  if (
    value.notes !== undefined &&
    value.notes !== null &&
    typeof value.notes !== 'string'
  ) {
    throw new ApiError(400, 'notes must be a string or null');
  }

  return {
    restaurantId: value.restaurantId,
    date: value.date,
    amountSpent:
      typeof value.amountSpent === 'number'
        ? value.amountSpent
        : null,
    notes:
      typeof value.notes === 'string' && value.notes.trim().length > 0
        ? value.notes.trim()
        : null,
  };
}