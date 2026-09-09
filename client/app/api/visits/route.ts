import { NextResponse } from 'next/server';
import { pool } from '@/db/pool';
import { ApiError, handleError } from '@/lib/errors';
import { toVisit } from '@/lib/types';
import { validateVisitInput } from '@/lib/visitValidation';

/**
 * POST /api/visits
 * Records a new restaurant visit.
 */
export async function POST(req: Request) {
  try {
    const body: unknown = await req.json();
    const visit = validateVisitInput(body);

    const restaurantResult = await pool.query(
      'SELECT id FROM restaurants WHERE id = $1',
      [visit.restaurantId]
    );

    if (restaurantResult.rows.length === 0) {
      throw new ApiError(404, 'Restaurant not found');
    }

    const { rows } = await pool.query(
      `INSERT INTO visits (
         "restaurantId",
         date,
         "amountSpent",
         notes
       )
       VALUES ($1, $2, $3, $4)
       RETURNING
         id,
         "restaurantId",
         date,
         "amountSpent",
         notes,
         created_at AS "createdAt"`,
      [
        visit.restaurantId,
        visit.date,
        visit.amountSpent,
        visit.notes,
      ]
    );

    return NextResponse.json(
      toVisit(rows[0]),
      { status: 201 }
    );
  } catch (err) {
    return handleError(err);
  }
}