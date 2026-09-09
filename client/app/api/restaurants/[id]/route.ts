import { NextResponse } from 'next/server';
import { pool } from '@/db/pool';
import { handleError } from '@/lib/errors';
import { toRestaurant } from '@/lib/types';
import {
  parseRestaurantId,
  validateRestaurantInput,
} from '@/lib/restaurantValidation';

type Params = { params: { id: string } };

/**
 * Create the standard 404 response used by all three handlers.
 */
function notFoundResponse() {
  return NextResponse.json(
    { error: 'Restaurant not found' },
    { status: 404 }
  );
}

/**
 * GET /api/restaurants/:id
 * Returns one restaurant, or 404 if it does not exist.
 */
export async function GET(_req: Request, { params }: Params) {
  try {
    const id = parseRestaurantId(params.id);

    if (id === null) {
      return notFoundResponse();
    }

    const { rows } = await pool.query(
      `SELECT
         id,
         name,
         cuisine,
         address,
         rating,
         created_at AS "createdAt"
       FROM restaurants
       WHERE id = $1`,
      [id]
    );

    if (rows.length === 0) {
      return notFoundResponse();
    }

    return NextResponse.json(toRestaurant(rows[0]));
  } catch (err) {
    return handleError(err);
  }
}

/**
 * PUT /api/restaurants/:id
 * Updates and returns an existing restaurant.
 */
export async function PUT(req: Request, { params }: Params) {
  try {
    const id = parseRestaurantId(params.id);

    if (id === null) {
      return notFoundResponse();
    }

    const body: unknown = await req.json();
    const restaurant = validateRestaurantInput(body);

    const { rows } = await pool.query(
      `UPDATE restaurants
       SET
         name = $1,
         cuisine = $2,
         address = $3,
         rating = $4
       WHERE id = $5
       RETURNING
         id,
         name,
         cuisine,
         address,
         rating,
         created_at AS "createdAt"`,
      [
        restaurant.name,
        restaurant.cuisine,
        restaurant.address,
        restaurant.rating,
        id,
      ]
    );

    if (rows.length === 0) {
      return notFoundResponse();
    }

    return NextResponse.json(toRestaurant(rows[0]));
  } catch (err) {
    return handleError(err);
  }
}

/**
 * DELETE /api/restaurants/:id
 * Deletes a restaurant and returns an empty 204 response.
 */
export async function DELETE(_req: Request, { params }: Params) {
  try {
    const id = parseRestaurantId(params.id);

    if (id === null) {
      return notFoundResponse();
    }

    const result = await pool.query(
      'DELETE FROM restaurants WHERE id = $1',
      [id]
    );

    if (result.rowCount === 0) {
      return notFoundResponse();
    }

    return new NextResponse(null, { status: 204 });
  } catch (err) {
    return handleError(err);
  }
}