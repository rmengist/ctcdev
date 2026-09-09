# Write-up

> This is the skeleton - replace everything in blockquotes with your own words
> and delete the prompts as you go. Aim for **~300 words** across the four
> questions; the route reference below can be as long as it needs to be.
>
> Write it like you're handing the work to a teammate. We'd rather read an
> honest "I ran out of time on X and here's what I'd do" than a polished list of
> accomplishments. **Submit this even if you didn't finish** - see CHALLENGE.md.

## 1. What did you build for Part B, and why that?

> What made you pick it over everything else you could have built? This is the
> question we care most about - the _why_ matters more than the _what_.

For Part B, I built a visit-recording feature and a selectable restaurant leaderboard. Users can record when Brennen visits a restaurant, including the date, amount spent, and optional notes. They can rank restaurants by number of visits, average amount spent, or rating. I also added website forms for creating and editing restaurants so users do not need to modify seed data or use the terminal for normal tasks.
I chose this feature because the application is meant to track Brennen’s visits and spending, but the starter UI only displayed restaurants. Recording visits makes the existing visits table useful, while the leaderboard turns those records into answers to practical questions: Where does Brennen eat most often, and where does he spend the most?

## 2. What did you decide, and what did you rule out?

> Route shapes, data model, where the logic lives, what you deliberately didn't
> do. Name a tradeoff you're not sure you got right.

I calculate leaderboard values from restaurant and visit records instead of storing separate totals. This avoids duplicated state and ensures that rankings reflect the latest data. One leaderboard endpoint accepts a validated sort parameter, while a fixed switch chooses the SQL query. The frontend displays only the selected metric.
I included restaurants with no visits in the visit leaderboard by using a LEFT JOIN. I ruled out distance-based ranking because the schema has no coordinates or starting location, and accurate distance would require additional location data or an external service.
One tradeoff I am unsure about is displaying restaurants with no spending data at the bottom of the average-spending leaderboard instead of excluding them.

## 3. Where did you cut corners?

> What would you fix first with another day?

I did not add visit history, visit editing or deletion, pagination, or automated tests. With another day, I would add a visit-history screen with edit and delete controls, automated API tests to catch regressions and verify validation and error responses consistently, and separate visual styles for success and error messages.

---

## Part B: routes

> Every endpoint you added, with its request and response shapes, so we can
> exercise it without reverse-engineering your code. Add or remove rows as
> needed; delete this section if your Part B added no routes.

| Method and path | What it does | Success | Errors       |
| --------------- | ------------ | ------- | ------------ |
| `POST /api/visits`|Records a restaurant visit| `201` + created visit| `400` for invalid input; `404` if the restaurant does not exist|
| `GET /api/restaurants/leaderboard?sort=visits` |Ranks restaurants by visit count| `200` + leaderboard| `400` for an unsupported `sort` value |
| `GET /api/restaurants/leaderboard?sort=average-spend` |Ranks restaurants by average visit spending| `200` + leaderboard| `400` for an unsupported `sort` value |
| `GET /api/restaurants/leaderboard?sort=rating` |Ranks restaurants by rating| `200` + leaderboard| `400` for an unsupported `sort` value |

**`POST /api/visits`**
Request:
{
  "restaurantId": 1,
  "date": "2026-09-09",
  "amountSpent": 24.75,
  "notes": "Dinner"
}
`201 Created` response:
{
  "id": 4,
  "restaurantId": 1,
  "date": "2026-09-09",
  "amountSpent": 24.75,
  "notes": "Dinner",
  "createdAt": "2026-09-09T20:30:00.000Z"
}
`amountSpent` and `notes` may be `null`. The API validates that `restaurantId` is a positive integer, the restaurant exists, the date is a real calendar date in `YYYY-MM-DD` format, and the amount is nonnegative.

**`GET /api/restaurants/leaderboard`**
Example request:
GET /api/restaurants/leaderboard?sort=visits
200 OK response:
{
  "sort": "visits",
  "label": "Visits",
  "entries": [
    {
      "restaurantId": 1,
      "name": "The Rusty Spoon",
      "value": 4
    }
  ]
}
Accepted sort values are visits, average-spend, and rating. The value property represents only the selected measurement. It may be null when a restaurant has no rating or recorded spending.


## Schema changes

> Any migrations you added (`002_*.sql`, ...), new tables or columns, and
> anything a reviewer needs to run beyond `./setup.sh`. Write "none" if there
> were none.

None. Part B uses the existing restaurants and visits tables. A fresh reviewer only needs to run ./setup.sh.

## How I verified this

> How you checked your work - the happy paths _and_ the failures. `curl`
> commands, a Postman collection, a scratch script, screenshots: whatever you
> actually used. Paste the commands.
>
> This is much faster for us to review than working it out ourselves, and it's
> how you show you checked the edge cases.

**Part A** - the contract table in CHALLENGE.md, every row including the error
cases:

## How I verified this

I first confirmed that the project compiled and passed TypeScript checking:

```bash
cd client
npm run build
```

I then ran the application with `npm run dev` and used a second terminal for the following tests.

### Part A

```bash
# List restaurants: expected 200 and a JSON array
curl -i http://localhost:3000/api/restaurants

# Retrieve an existing restaurant: expected 200
curl -i http://localhost:3000/api/restaurants/1

# Retrieve a missing restaurant: expected 404
curl -i http://localhost:3000/api/restaurants/99999

# Test invalid IDs: each expected 404
curl -i http://localhost:3000/api/restaurants/abc
curl -i http://localhost:3000/api/restaurants/-1
curl -i http://localhost:3000/api/restaurants/1.5
curl -i http://localhost:3000/api/restaurants/0

# Create a valid restaurant: expected 201
curl -i -X POST http://localhost:3000/api/restaurants -H 'Content-Type: application/json' -d '{"name":"Valid Spot","cuisine":"Test","address":"2 Test St","rating":4.5}'

# Missing name: expected 400
curl -i -X POST http://localhost:3000/api/restaurants -H 'Content-Type: application/json' -d '{"cuisine":"Test","rating":4}'

# Rating outside the accepted range: expected 400
curl -i -X POST http://localhost:3000/api/restaurants -H 'Content-Type: application/json' -d '{"name":"Out Of Range","rating":6}'

# Incorrect rating type: expected 400
curl -i -X POST http://localhost:3000/api/restaurants -H 'Content-Type: application/json' -d '{"name":"Wrong Type","rating":"five"}'

# Malformed JSON: expected 400
curl -i -X POST http://localhost:3000/api/restaurants -H 'Content-Type: application/json' -d '{"name":"Broken"'
```

The successful `POST` response contains the newly created restaurant’s ID. I assigned that returned ID to a terminal variable before testing update and deletion. The value below is an example and must be replaced with the ID actually returned by `POST`.

```bash
TEST_ID=7

# Update the created restaurant: expected 200
curl -i -X PUT "http://localhost:3000/api/restaurants/$TEST_ID" -H 'Content-Type: application/json' -d '{"name":"Updated Spot","cuisine":"Italian","address":"3 Test St","rating":5}'

# Update with invalid input: expected 400
curl -i -X PUT "http://localhost:3000/api/restaurants/$TEST_ID" -H 'Content-Type: application/json' -d '{"name":"","rating":7}'

# Update a missing restaurant: expected 404
curl -i -X PUT http://localhost:3000/api/restaurants/99999 -H 'Content-Type: application/json' -d '{"name":"Missing Restaurant","rating":4}'

# Delete the created restaurant: expected 204 with no response body
curl -i -X DELETE "http://localhost:3000/api/restaurants/$TEST_ID"

# Delete the same restaurant again: expected 404
curl -i -X DELETE "http://localhost:3000/api/restaurants/$TEST_ID"
```

### Part B

```bash
# Record a valid visit: expected 201
curl -i -X POST http://localhost:3000/api/visits -H 'Content-Type: application/json' -d '{"restaurantId":1,"date":"2026-09-09","amountSpent":24.75,"notes":"Dinner"}'

# Invalid date and negative amount: expected 400
curl -i -X POST http://localhost:3000/api/visits -H 'Content-Type: application/json' -d '{"restaurantId":1,"date":"bad-date","amountSpent":-5}'

# Invalid restaurant ID type: expected 400
curl -i -X POST http://localhost:3000/api/visits -H 'Content-Type: application/json' -d '{"restaurantId":"one","date":"2026-09-09","amountSpent":20}'

# Nonexistent restaurant: expected 404
curl -i -X POST http://localhost:3000/api/visits -H 'Content-Type: application/json' -d '{"restaurantId":99999,"date":"2026-09-09","amountSpent":20}'

# Malformed JSON: expected 400
curl -i -X POST http://localhost:3000/api/visits -H 'Content-Type: application/json' -d '{"restaurantId":1'
```

I tested all three supported leaderboard options:

```bash
# Most visited: expected 200
curl -i "http://localhost:3000/api/restaurants/leaderboard?sort=visits"

# Highest average amount spent: expected 200
curl -i "http://localhost:3000/api/restaurants/leaderboard?sort=average-spend"

# Highest rating: expected 200
curl -i "http://localhost:3000/api/restaurants/leaderboard?sort=rating"

# Unsupported option: expected 400
curl -i "http://localhost:3000/api/restaurants/leaderboard?sort=random"
```

I also used the website to add and edit a restaurant, record a visit, switch between the three leaderboard options, and confirm that the rankings updated. I refreshed the page to confirm that the submitted information remained stored in PostgreSQL.


## Known issues / what I'd do next

> Anything broken, unfinished, or that you know is wrong. Being upfront here
> costs you nothing and tells us a lot.
The application does not currently show a complete visit history or allow visits to be edited and deleted. Validation and API behavior were tested manually rather than through an automated test suite. The UI displays response messages, but success and failure messages could be distinguished more clearly for accessibility. These are the first areas I would improve next.
