import { NextResponse } from 'next/server';
import { pool } from '@/db/pool';
import { handleError } from '@/lib/errors';
import { toRestaurant } from '@/lib/types';
import { validateRestaurantInput } from '@/lib/restaurantValidation';

/**
 * GET /api/restaurants
 * Returns all restaurants.
 */
export async function GET() {
  try {
    const { rows } = await pool.query(
      `SELECT
         id,
         name,
         cuisine,
         address,
         rating,
         created_at AS "createdAt"
       FROM restaurants
       ORDER BY created_at DESC`
    );

    return NextResponse.json(rows.map(toRestaurant));
  } catch (err) {
    return handleError(err);
  }
}

/**
 * POST /api/restaurants
 * Creates and returns a restaurant.
 */
export async function POST(req: Request) {
  try {
    const body: unknown = await req.json();
    const restaurant = validateRestaurantInput(body);

    const { rows } = await pool.query(
      `INSERT INTO restaurants (
         name,
         cuisine,
         address,
         rating
       )
       VALUES ($1, $2, $3, $4)
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
      ]
    );

    return NextResponse.json(
      toRestaurant(rows[0]),
      { status: 201 }
    );
  } catch (err) {
    return handleError(err);
  }
}