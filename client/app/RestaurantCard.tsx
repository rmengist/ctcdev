'use client';

import { FormEvent, useState } from 'react';
import type { Restaurant } from '@/lib/types';

interface RestaurantCardProps {
  restaurant: Restaurant;
  onSaved: () => Promise<void>;
}

async function getResponseError(
  response: Response
): Promise<string> {
  try {
    const body = await response.json();
    return body.error ?? 'The restaurant could not be updated.';
  } catch {
    return 'The restaurant could not be updated.';
  }
}

export default function RestaurantCard({
  restaurant,
  onSaved,
}: RestaurantCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(restaurant.name);
  const [cuisine, setCuisine] = useState(
    restaurant.cuisine ?? ''
  );
  const [address, setAddress] = useState(
    restaurant.address ?? ''
  );
  const [rating, setRating] = useState(
    restaurant.rating === null
      ? ''
      : restaurant.rating.toString()
  );
  const [message, setMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  function cancelEditing() {
    setName(restaurant.name);
    setCuisine(restaurant.cuisine ?? '');
    setAddress(restaurant.address ?? '');
    setRating(
      restaurant.rating === null
        ? ''
        : restaurant.rating.toString()
    );
    setMessage('');
    setIsEditing(false);
  }

  async function handleUpdate(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();
    setMessage('');
    setIsSaving(true);

    try {
      const response = await fetch(
        `/api/restaurants/${restaurant.id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name,
            cuisine: cuisine.trim() === '' ? null : cuisine,
            address: address.trim() === '' ? null : address,
            rating: rating === '' ? null : Number(rating),
          }),
        }
      );

      if (!response.ok) {
        throw new Error(await getResponseError(response));
      }

      await onSaved();
      setIsEditing(false);
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : 'The restaurant could not be updated.'
      );
    } finally {
      setIsSaving(false);
    }
  }

  if (isEditing) {
    return (
      <li className="blue-card">
        <form onSubmit={handleUpdate} className="space-y-4">
          <div>
            <p className="section-label">Editing</p>
            <h3 className="font-display text-xl font-bold text-blue-950">
              {restaurant.name}
            </h3>
          </div>

          <div>
            <label
              htmlFor={`name-${restaurant.id}`}
              className="form-label"
            >
              Restaurant name
            </label>
            <input
              id={`name-${restaurant.id}`}
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="form-input"
              required
            />
          </div>

          <div>
            <label
              htmlFor={`cuisine-${restaurant.id}`}
              className="form-label"
            >
              Cuisine
            </label>
            <input
              id={`cuisine-${restaurant.id}`}
              value={cuisine}
              onChange={(event) =>
                setCuisine(event.target.value)
              }
              className="form-input"
            />
          </div>

          <div>
            <label
              htmlFor={`address-${restaurant.id}`}
              className="form-label"
            >
              Address
            </label>
            <input
              id={`address-${restaurant.id}`}
              value={address}
              onChange={(event) =>
                setAddress(event.target.value)
              }
              className="form-input"
            />
          </div>

          <div>
            <label
              htmlFor={`rating-${restaurant.id}`}
              className="form-label"
            >
              Rating
            </label>
            <input
              id={`rating-${restaurant.id}`}
              type="number"
              min="0"
              max="5"
              step="0.1"
              value={rating}
              onChange={(event) =>
                setRating(event.target.value)
              }
              className="form-input"
            />
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={isSaving}
              className="primary-button"
            >
              {isSaving ? 'Saving...' : 'Save changes'}
            </button>

            <button
              type="button"
              onClick={cancelEditing}
              disabled={isSaving}
              className="secondary-button"
            >
              Cancel
            </button>
          </div>

          {message && (
            <p className="status-message">{message}</p>
          )}
        </form>
      </li>
    );
  }

  return (
    <li className="blue-card">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="font-display text-xl font-bold text-blue-950">
            {restaurant.name}
          </h3>

          <p className="mt-1 text-sm text-slate-600">
            {restaurant.cuisine ?? 'Cuisine unknown'}
          </p>

          <p className="mt-1 text-sm text-slate-500">
            {restaurant.address ?? 'Address unavailable'}
          </p>
        </div>

        <span className="rounded-full bg-sky-100 px-3 py-1 text-sm font-bold text-blue-700">
          {restaurant.rating === null
            ? 'Not rated'
            : `${restaurant.rating} ★`}
        </span>
      </div>

      <button
        type="button"
        onClick={() => setIsEditing(true)}
        className="secondary-button mt-5"
      >
        Edit restaurant
      </button>
    </li>
  );
}