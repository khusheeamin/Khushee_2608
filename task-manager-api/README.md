# Task Manager API

This folder contains a simple Express + Mongoose backend for a Task Manager.

Quick notes
- Start the server: `npm start` (ensure MongoDB is running or set `MONGODB_URI`).
- Set `JWT_SECRET` to a long, random value in production. Tokens expire after one hour.
- Seed one example task: `node seed-one-task.js`

Endpoints
- POST /register — create a user with a bcrypt-hashed password (requires `email` and an 8+ character `password`)
- POST /login — verify credentials and return a JWT
- GET /tasks — list tasks (requires `Authorization: Bearer <token>`)
- GET /tasks/:id — get a single task (requires authentication)
- POST /tasks — create task (requires authentication and `title`)
- PUT /tasks/:id — update task (requires authentication)
- DELETE /tasks/:id — delete task (requires authentication)

Task creation notifications
- After a task is saved and the `POST /tasks` response finishes, the API emits a `task-created` event.
- Its listener uses `setImmediate` to log the task title, notification timestamp, and authenticated user assigned to the task without delaying the response.
- The log includes an API response timestamp and a separate notification timestamp to show the asynchronous ordering.
- Run `npm test` to verify that the notification listener runs asynchronously.

Example - create one task using curl

```bash
curl -X POST http://localhost:5000/tasks \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer <token>' \
  -d '{"title":"Initial task","description":"Seeded task","priority":"medium"}'
```

Seed script
- Run `node seed-one-task.js` to insert a single example task into the database.

Postman
- Use the same endpoints and include `Content-Type: application/json` for POST/PUT.
