import {
  getLeaderboard,
  getRestaurants,
} from '@/lib/apiClient';
import Dashboard from './Dashboard';

export default async function HomePage() {
  const [restaurants, leaderboard] = await Promise.all([
    getRestaurants(),
    getLeaderboard('visits'),
  ]);

  return (
    <Dashboard
      initialRestaurants={restaurants}
      initialLeaderboard={leaderboard}
    />
  );
}