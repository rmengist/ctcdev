import type {
  LeaderboardResponse,
  LeaderboardSort,
  Restaurant,
} from './types';

export const API_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

async function getJson<T>(url: string): Promise<T> {
  const res = await fetch(url, { cache: 'no-store' });

  if (!res.ok) {
    throw new Error(`API request failed with status ${res.status}`);
  }

  return res.json();
}

export async function getRestaurants(): Promise<Restaurant[]> {
  return getJson<Restaurant[]>(
    `${API_URL}/api/restaurants`
  );
}

export async function getRestaurant(
  id: number | string
): Promise<Restaurant> {
  return getJson<Restaurant>(
    `${API_URL}/api/restaurants/${id}`
  );
}

export async function getLeaderboard(
  sort: LeaderboardSort = 'visits'
): Promise<LeaderboardResponse> {
  return getJson<LeaderboardResponse>(
    `${API_URL}/api/restaurants/leaderboard?sort=${sort}`
  );
}