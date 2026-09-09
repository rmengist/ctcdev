import { NextResponse } from 'next/server';
import { pool } from '@/db/pool';
import { handleError } from '@/lib/errors';
import type {
  LeaderboardEntry,
  LeaderboardResponse,
  LeaderboardSort,
} from '@/lib/types';

export const dynamic = 'force-dynamic';

function isLeaderboardSort(
  value: string
): value is LeaderboardSort {
  return (
    value === 'visits' ||
    value === 'average-spend' ||
    value === 'rating'
  );
}

/**
 * GET /api/restaurants/leaderboard?sort=visits
 *
 * Supported sort values:
 * - visits
 * - average-spend
 * - rating
 */
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const requestedSort =
      url.searchParams.get('sort') ?? 'visits';

    if (!isLeaderboardSort(requestedSort)) {
      return NextResponse.json(
        {
          error:
            'sort must be visits, average-spend, or rating',
        },
        { status: 400 }
      );
    }

    let query: string;
    let label: string;

    switch (requestedSort) {
      case 'average-spend':
        label = 'Average amount spent';

        query = `
          SELECT
            r.id AS "restaurantId",
            r.name,
            ROUND(AVG(v."amountSpent"), 2)::float8 AS value
          FROM restaurants r
          LEFT JOIN visits v
            ON v."restaurantId" = r.id
          GROUP BY r.id, r.name
          ORDER BY value DESC NULLS LAST, r.name ASC
        `;
        break;

      case 'rating':
        label = 'Rating';

        query = `
          SELECT
            r.id AS "restaurantId",
            r.name,
            r.rating::float8 AS value
          FROM restaurants r
          ORDER BY value DESC NULLS LAST, r.name ASC
        `;
        break;

      case 'visits':
      default:
        label = 'Visits';

        query = `
          SELECT
            r.id AS "restaurantId",
            r.name,
            COUNT(v.id)::int AS value
          FROM restaurants r
          LEFT JOIN visits v
            ON v."restaurantId" = r.id
          GROUP BY r.id, r.name
          ORDER BY value DESC, r.name ASC
        `;
        break;
    }

    const { rows } = await pool.query(query);

    const entries: LeaderboardEntry[] = rows.map((row) => ({
      restaurantId: Number(row.restaurantId),
      name: String(row.name),
      value:
        row.value === null || row.value === undefined
          ? null
          : Number(row.value),
    }));

    const response: LeaderboardResponse = {
      sort: requestedSort,
      label,
      entries,
    };

    return NextResponse.json(response);
  } catch (err) {
    return handleError(err);
  }
}