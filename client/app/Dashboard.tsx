'use client';

import { FormEvent, useState } from 'react';
import type {
  LeaderboardResponse,
  LeaderboardSort,
  Restaurant,
} from '@/lib/types';
import RestaurantCard from './RestaurantCard';


interface DashboardProps {
  initialRestaurants: Restaurant[];
  initialLeaderboard: LeaderboardResponse;
}

async function getResponseError(
  response: Response
): Promise<string> {
  try {
    const body = await response.json();
    return body.error ?? 'The request could not be completed.';
  } catch {
    return 'The request could not be completed.';
  }
}

export default function Dashboard({
  initialRestaurants,
  initialLeaderboard,
}: DashboardProps) {
  const [restaurants, setRestaurants] =
    useState(initialRestaurants);

  const [leaderboard, setLeaderboard] =
    useState(initialLeaderboard);

  const [leaderboardSort, setLeaderboardSort] =
    useState<LeaderboardSort>(initialLeaderboard.sort);

  // Restaurant form state
  const [restaurantName, setRestaurantName] = useState('');
  const [cuisine, setCuisine] = useState('');
  const [address, setAddress] = useState('');
  const [rating, setRating] = useState('');
  const [restaurantMessage, setRestaurantMessage] =
    useState('');
  const [savingRestaurant, setSavingRestaurant] =
    useState(false);

  // Visit form state
  const [visitRestaurantId, setVisitRestaurantId] =
    useState(initialRestaurants[0]?.id.toString() ?? '');
  const [visitDate, setVisitDate] = useState('');
  const [amountSpent, setAmountSpent] = useState('');
  const [notes, setNotes] = useState('');
  const [visitMessage, setVisitMessage] = useState('');
  const [savingVisit, setSavingVisit] = useState(false);

  async function loadRestaurants() {
    const response = await fetch('/api/restaurants', {
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(await getResponseError(response));
    }

    const updatedRestaurants: Restaurant[] =
      await response.json();

    setRestaurants(updatedRestaurants);

    if (
      updatedRestaurants.length > 0 &&
      !updatedRestaurants.some(
        (restaurant) =>
          restaurant.id.toString() === visitRestaurantId
      )
    ) {
      setVisitRestaurantId(
        updatedRestaurants[0].id.toString()
      );
    }
  }

  async function loadLeaderboard(sort: LeaderboardSort) {
    const response = await fetch(
      `/api/restaurants/leaderboard?sort=${sort}`,
      { cache: 'no-store' }
    );

    if (!response.ok) {
      throw new Error(await getResponseError(response));
    }

    const updatedLeaderboard: LeaderboardResponse =
      await response.json();

    setLeaderboard(updatedLeaderboard);
  }

  function resetRestaurantForm() {
    setRestaurantName('');
    setCuisine('');
    setAddress('');
    setRating('');
    }

  async function handleRestaurantSubmit(
    event: FormEvent<HTMLFormElement>
    ) {
    event.preventDefault();
    setRestaurantMessage('');
    setSavingRestaurant(true);

    try {
        const response = await fetch('/api/restaurants', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            name: restaurantName,
            cuisine: cuisine.trim() === '' ? null : cuisine,
            address: address.trim() === '' ? null : address,
            rating: rating === '' ? null : Number(rating),
        }),
        });

        if (!response.ok) {
        throw new Error(await getResponseError(response));
        }

        resetRestaurantForm();
        setRestaurantMessage(
        'Restaurant added successfully!'
        );

        await Promise.all([
        loadRestaurants(),
        loadLeaderboard(leaderboardSort),
        ]);
    } catch (error) {
        setRestaurantMessage(
        error instanceof Error
            ? error.message
            : 'Could not add the restaurant.'
        );
    } finally {
        setSavingRestaurant(false);
    }
    }

  async function handleVisitSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();
    setVisitMessage('');

    if (!visitRestaurantId) {
      setVisitMessage('Please select a restaurant.');
      return;
    }

    setSavingVisit(true);

    try {
      const response = await fetch('/api/visits', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          restaurantId: Number(visitRestaurantId),
          date: visitDate,
          amountSpent:
            amountSpent === '' ? null : Number(amountSpent),
          notes: notes.trim() === '' ? null : notes,
        }),
      });

      if (!response.ok) {
        throw new Error(await getResponseError(response));
      }

      setAmountSpent('');
      setNotes('');
      setVisitMessage('Visit recorded successfully!');

      await loadLeaderboard(leaderboardSort);
    } catch (error) {
      setVisitMessage(
        error instanceof Error
          ? error.message
          : 'Could not record the visit.'
      );
    } finally {
      setSavingVisit(false);
    }
  }

  async function handleLeaderboardChange(
    nextSort: LeaderboardSort
  ) {
    setLeaderboardSort(nextSort);

    try {
      await loadLeaderboard(nextSort);
    } catch {
      setVisitMessage('Could not update the leaderboard.');
    }
  }

  function formatLeaderboardValue(
    value: number | null
  ): string {
    switch (leaderboard.sort) {
      case 'average-spend':
        return value === null
          ? 'No spending data'
          : `$${value.toFixed(2)} average`;

      case 'rating':
        return value === null
          ? 'Not rated'
          : `${value.toFixed(1)} ★`;

      case 'visits':
      default:
        return `${value ?? 0} ${
          value === 1 ? 'visit' : 'visits'
        }`;
    }
  }

  return (
    <div className="space-y-8">
      <section className="overflow-hidden rounded-3xl bg-gradient-to-r from-blue-700 via-sky-600 to-cyan-500 px-6 py-10 text-white shadow-xl shadow-blue-200/60 sm:px-10">
        <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-blue-100">
          Restaurant diary
        </p>

        <h1 className="font-display text-4xl font-bold sm:text-5xl">
          Feeding Brennen
        </h1>

        <p className="mt-3 max-w-xl text-blue-50">
          Save favorite restaurants, record every visit, and
          discover where Brennen goes most.
        </p>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Restaurant form */}
        <section className="blue-card">
          <div className="mb-5">
            <p className="section-label">Restaurants</p>
            <h2 className="font-display text-2xl font-bold text-blue-950">
                Add a restaurant
            </h2>
          </div>

          <form
            onSubmit={handleRestaurantSubmit}
            className="space-y-4"
          >
            <div>
              <label htmlFor="restaurantName" className="form-label">
                Restaurant name
              </label>
              <input
                id="restaurantName"
                value={restaurantName}
                onChange={(event) =>
                  setRestaurantName(event.target.value)
                }
                className="form-input"
                placeholder="Bluebird Café"
                required
              />
            </div>

            <div>
              <label htmlFor="cuisine" className="form-label">
                Cuisine
              </label>
              <input
                id="cuisine"
                value={cuisine}
                onChange={(event) =>
                  setCuisine(event.target.value)
                }
                className="form-input"
                placeholder="Ethiopian"
              />
            </div>

            <div>
              <label htmlFor="address" className="form-label">
                Address
              </label>
              <input
                id="address"
                value={address}
                onChange={(event) =>
                  setAddress(event.target.value)
                }
                className="form-input"
                placeholder="123 Ocean Avenue"
              />
            </div>

            <div>
              <label htmlFor="rating" className="form-label">
                Rating
              </label>
              <input
                id="rating"
                type="number"
                min="0"
                max="5"
                step="0.1"
                value={rating}
                onChange={(event) =>
                  setRating(event.target.value)
                }
                className="form-input"
                placeholder="4.5"
              />
            </div>

            <button
                type="submit"
                disabled={savingRestaurant}
                className="primary-button"
            >
                {savingRestaurant ? 'Adding...' : 'Add restaurant'}
            </button>

            {restaurantMessage && (
              <p className="status-message">
                {restaurantMessage}
              </p>
            )}
          </form>
        </section>

        {/* Visit form */}
        <section className="blue-card">
          <div className="mb-5">
            <p className="section-label">Visit diary</p>
            <h2 className="font-display text-2xl font-bold text-blue-950">
              Record a visit
            </h2>
          </div>

          {restaurants.length === 0 ? (
            <p className="text-sm text-slate-600">
              Add a restaurant before recording a visit.
            </p>
          ) : (
            <form
              onSubmit={handleVisitSubmit}
              className="space-y-4"
            >
              <div>
                <label
                  htmlFor="visitRestaurant"
                  className="form-label"
                >
                  Restaurant
                </label>
                <select
                  id="visitRestaurant"
                  value={visitRestaurantId}
                  onChange={(event) =>
                    setVisitRestaurantId(event.target.value)
                  }
                  className="form-input"
                  required
                >
                  {restaurants.map((restaurant) => (
                    <option
                      key={restaurant.id}
                      value={restaurant.id}
                    >
                      {restaurant.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="visitDate" className="form-label">
                  Date
                </label>
                <input
                  id="visitDate"
                  type="date"
                  value={visitDate}
                  onChange={(event) =>
                    setVisitDate(event.target.value)
                  }
                  className="form-input"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="amountSpent"
                  className="form-label"
                >
                  Amount spent
                </label>
                <input
                  id="amountSpent"
                  type="number"
                  min="0"
                  step="0.01"
                  value={amountSpent}
                  onChange={(event) =>
                    setAmountSpent(event.target.value)
                  }
                  className="form-input"
                  placeholder="25.00"
                />
              </div>

              <div>
                <label htmlFor="notes" className="form-label">
                  Notes
                </label>
                <textarea
                  id="notes"
                  value={notes}
                  onChange={(event) =>
                    setNotes(event.target.value)
                  }
                  className="form-input"
                  placeholder="What did Brennen order?"
                  rows={3}
                />
              </div>

              <button
                type="submit"
                disabled={savingVisit}
                className="primary-button"
              >
                {savingVisit ? 'Recording...' : 'Record visit'}
              </button>

              {visitMessage && (
                <p className="status-message">{visitMessage}</p>
              )}
            </form>
          )}
        </section>
      </div>

      {/* Leaderboard */}
      <section className="blue-card">
        <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="section-label">Leaderboard</p>
            <h2 className="font-display text-2xl font-bold text-blue-950">
              Brennen&apos;s rankings
            </h2>
          </div>

          <div>
            <label
              htmlFor="leaderboardSort"
              className="form-label"
            >
              Rank restaurants by
            </label>
            <select
              id="leaderboardSort"
              value={leaderboardSort}
              onChange={(event) =>
                handleLeaderboardChange(
                  event.target.value as LeaderboardSort
                )
              }
              className="form-input min-w-56"
            >
              <option value="visits">Most visited</option>
              <option value="average-spend">
                Highest average spent
              </option>
              <option value="rating">Highest rating</option>
            </select>
          </div>
        </div>

        {leaderboard.entries.length === 0 ? (
          <p className="text-sm text-slate-600">
            No restaurants are available yet.
          </p>
        ) : (
          <ol className="space-y-3">
            {leaderboard.entries.map((entry, index) => (
              <li
                key={entry.restaurantId}
                className="flex items-center justify-between rounded-2xl border border-blue-100 bg-blue-50/70 px-4 py-4"
              >
                <div className="flex items-center gap-4">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-700 font-bold text-white">
                    {index + 1}
                  </span>

                  <span className="font-semibold text-blue-950">
                    {entry.name}
                  </span>
                </div>

                <span className="rounded-full bg-white px-3 py-1 text-sm font-semibold text-blue-700 shadow-sm">
                  {formatLeaderboardValue(entry.value)}
                </span>
              </li>
            ))}
          </ol>
        )}
      </section>

      {/* Restaurant list */}
      <section>
        <div className="mb-5">
          <p className="section-label">Saved places</p>
          <h2 className="font-display text-2xl font-bold text-blue-950">
            Restaurants
          </h2>
        </div>

        {restaurants.length === 0 ? (
          <div className="blue-card text-sm text-slate-600">
            No restaurants have been added.
          </div>
        ) : (
          <ul className="grid items-start gap-4 sm:grid-cols-2">
            {restaurants.map((restaurant) => (
                <RestaurantCard
                    key={restaurant.id}
                    restaurant={restaurant}
                    onSaved={async () => {
                        await Promise.all([
                            loadRestaurants(),
                            loadLeaderboard(leaderboardSort),
                        ]);
                    }}
                />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}