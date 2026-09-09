import { ApiError } from '@/lib/errors';

export interface RestaurantInput {
  name: string;
  cuisine: string | null;
  address: string | null;
  rating: number | null;
}

/**
 * Restaurant IDs must be positive integers.
 *
 * The challenge requires invalid IDs such as "abc", "-1", "0", and "1.5"
 * to return 404.
 */
export function parseRestaurantId(value: string): number | null {
  if (!/^[1-9]\d*$/.test(value)) {
    return null;
  }

  const id = Number(value);

  if (!Number.isSafeInteger(id)) {
    return null;
  }

  return id;
}

/**
 * Validate and normalize the body used by POST and PUT.
 */
export function validateRestaurantInput(body: unknown): RestaurantInput {
  if (
    typeof body !== 'object' ||
    body === null ||
    Array.isArray(body)
  ) {
    throw new ApiError(400, 'Request body must be a JSON object');
  }

  const value = body as Record<string, unknown>;

  if (typeof value.name !== 'string' || value.name.trim().length === 0) {
    throw new ApiError(400, 'name must be a non-empty string');
  }

  if (
    value.cuisine !== undefined &&
    value.cuisine !== null &&
    typeof value.cuisine !== 'string'
  ) {
    throw new ApiError(400, 'cuisine must be a string or null');
  }

  if (
    value.address !== undefined &&
    value.address !== null &&
    typeof value.address !== 'string'
  ) {
    throw new ApiError(400, 'address must be a string or null');
  }

  if (
    value.rating !== undefined &&
    value.rating !== null &&
    (
      typeof value.rating !== 'number' ||
      !Number.isFinite(value.rating) ||
      value.rating < 0 ||
      value.rating > 5
    )
  ) {
    throw new ApiError(
      400,
      'rating must be a number between 0 and 5, or null'
    );
  }

  return {
    name: value.name.trim(),
    cuisine:
      typeof value.cuisine === 'string'
        ? value.cuisine.trim()
        : null,
    address:
      typeof value.address === 'string'
        ? value.address.trim()
        : null,
    rating:
      typeof value.rating === 'number'
        ? value.rating
        : null,
  };
}