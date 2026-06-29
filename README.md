# 📝 Personal Notes API

A RESTful API for managing personal notes, built with **Node.js**, **Express**, **Prisma ORM**, and **MySQL**. Features JWT authentication, full CRUD, soft delete, search, filtering, sorting, and more.

---

## 🏗️ Project Structure

```
Personal Notes API/
├── prisma/
│   ├── schema.prisma        # Database schema
│   └── seed.js              # Database seed script
├── src/
│   ├── config/
│   │   └── db.js            # Prisma client instance
│   ├── controllers/
│   │   ├── authController.js
│   │   └── noteController.js
│   ├── middleware/
│   │   ├── auth.js          # JWT verification middleware
│   │   ├── errorHandler.js  # Global error handler
│   │   └── validate.js      # Request body validation
│   ├── routes/
│   │   ├── authRoutes.js
│   │   └── noteRoutes.js
│   └── server.js            # Express app entry point
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18+
- **MySQL** database (local or cloud — e.g. [Atlas](https://atlasgo.io/), PlanetScale, Aiven)
- **npm** or **yarn**

### 1. Clone & Install

```bash
git clone <your-repo-url>
cd personal-notes-api
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` with your MySQL connection string and a secure JWT secret:

```env
DATABASE_URL="mysql://username:password@host:3306/personal_notes_db"
JWT_SECRET="your-super-secret-jwt-key-change-this"
JWT_EXPIRES_IN="7d"
PORT=3000
NODE_ENV=development
```

### 3. Set Up Database

```bash
# Push schema to your MySQL database
npx prisma db push

# Generate Prisma client
npx prisma generate

# (Optional) Seed with demo data
npm run prisma:seed
```

> **Using Atlas?** If you manage migrations with [Atlas](https://atlasgo.io/), use `npx prisma db push` to sync schema and let Atlas handle migration history separately.

### 4. Start the Server

```bash
# Development (with auto-reload)
npm run dev

# Production
npm start
```

The API will be available at `http://localhost:3000`.

---

## 📡 API Endpoints

### Health Check

| Method | Endpoint       | Description           |
| ------ | -------------- | --------------------- |
| GET    | `/`            | API status            |
| GET    | `/api/health`  | Health check          |

---

### 🔐 Authentication

| Method | Endpoint             | Description                | Body                                |
| ------ | -------------------- | -------------------------- | ----------------------------------- |
| POST   | `/api/auth/register` | Register a new user        | `{ email, password, name }`         |
| POST   | `/api/auth/login`    | Login & receive JWT token  | `{ email, password }`               |
| GET    | `/api/auth/me`       | Get current user profile   | —  *(requires Bearer token)*        |

---

### 📝 Notes (All routes require `Authorization: Bearer <token>`)

| Method | Endpoint                  | Description                        | Body / Params                       |
| ------ | ------------------------- | ---------------------------------- | ----------------------------------- |
| POST   | `/api/notes`              | Create a new note                  | `{ title, content?, tags?, isPinned? }` |
| GET    | `/api/notes`              | Get all notes (non-deleted)        | Query params (see below)            |
| GET    | `/api/notes/:id`          | Get a single note by ID            | —                                   |
| PUT    | `/api/notes/:id`          | Update a note                      | `{ title?, content?, tags?, isPinned?, isArchived? }` |
| DELETE | `/api/notes/:id`          | Soft delete a note                 | —                                   |
| PATCH  | `/api/notes/:id/pin`      | Toggle pin/unpin                   | —                                   |
| PATCH  | `/api/notes/:id/archive`  | Toggle archive/unarchive           | —                                   |
| PATCH  | `/api/notes/:id/restore`  | Restore a soft-deleted note        | —                                   |
| GET    | `/api/notes/trash`        | Get all soft-deleted notes         | —                                   |

#### Query Parameters for `GET /api/notes`

| Param      | Type   | Description                                        | Example                       |
| ---------- | ------ | -------------------------------------------------- | ----------------------------- |
| `search`   | string | Search notes by title (case-insensitive)            | `?search=meeting`             |
| `tags`     | string | Filter by tags (comma-separated)                    | `?tags=work,personal`         |
| `sortBy`   | string | Sort field: `createdAt` or `updatedAt`              | `?sortBy=createdAt`           |
| `order`    | string | Sort order: `asc` or `desc` (default: `desc`)       | `?order=asc`                  |
| `pinned`   | string | Filter by pinned status: `true` or `false`          | `?pinned=true`                |
| `archived` | string | Filter by archived status: `true` or `false`        | `?archived=false`             |

> **Note:** Pinned notes always appear first in results, regardless of sort order.

---

## 🔒 Authentication Flow

1. **Register** — `POST /api/auth/register` with `{ email, password, name }`
2. **Login** — `POST /api/auth/login` with `{ email, password }` → receives JWT
3. **Use Token** — Include `Authorization: Bearer <token>` header in all `/api/notes/*` requests

---

## 📋 Example Requests

### Register

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "john@example.com", "password": "secret123", "name": "John Doe"}'
```

### Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "john@example.com", "password": "secret123"}'
```

### Create a Note

```bash
curl -X POST http://localhost:3000/api/notes \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-token>" \
  -d '{"title": "My Note", "content": "Hello world!", "tags": ["personal"]}'
```

### Search Notes

```bash
curl "http://localhost:3000/api/notes?search=meeting&sortBy=createdAt&order=desc" \
  -H "Authorization: Bearer <your-token>"
```

### Filter by Tags

```bash
curl "http://localhost:3000/api/notes?tags=work,meetings" \
  -H "Authorization: Bearer <your-token>"
```

### Pin a Note

```bash
curl -X PATCH http://localhost:3000/api/notes/<note-id>/pin \
  -H "Authorization: Bearer <your-token>"
```

### Soft Delete a Note

```bash
curl -X DELETE http://localhost:3000/api/notes/<note-id> \
  -H "Authorization: Bearer <your-token>"
```

### Restore from Trash

```bash
curl -X PATCH http://localhost:3000/api/notes/<note-id>/restore \
  -H "Authorization: Bearer <your-token>"
```

---

## ⚠️ Error Responses

All errors follow a consistent format:

```json
{
  "success": false,
  "message": "Descriptive error message"
}
```

| Status Code | Meaning                      |
| ----------- | ---------------------------- |
| 400         | Bad Request / Validation     |
| 401         | Unauthorized / Invalid Token |
| 404         | Resource Not Found           |
| 409         | Conflict (e.g., duplicate)   |
| 500         | Internal Server Error        |

---

## 🛠️ Available Scripts

| Command               | Description                         |
| --------------------- | ----------------------------------- |
| `npm run dev`         | Start dev server with auto-reload   |
| `npm start`           | Start production server             |
| `npm run prisma:migrate` | Run Prisma migrations            |
| `npm run prisma:generate` | Generate Prisma client          |
| `npm run prisma:studio`  | Open Prisma Studio (GUI)         |
| `npm run prisma:seed`    | Seed database with demo data     |

---

## 📄 License

ISC
