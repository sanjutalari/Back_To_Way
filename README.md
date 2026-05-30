# Lost & Found Hub

A comprehensive web application for university students to report and find lost items on campus.

## Features

- **User Authentication** - JWT-based secure login and registration
- **Item Management** - Post lost/found items with image uploads
- **Search & Filter** - Advanced search by keyword, category, and type
- **Tracking System** - Auto-generated tracking IDs for each report
- **Dashboard** - Personal dashboard to manage your reports
- **Image Upload** - Local file storage (5MB limit)
- **Responsive Design** - Mobile-friendly UI with Tailwind CSS

## Tech Stack

### Backend

- **Flask** - Python web framework
- **PostgreSQL / SQLite** - Relational database (Postgres recommended for production)
- **Flask-SQLAlchemy** - ORM
- **Flask-Migrate** - DB migrations (Alembic)
- **psycopg2-binary** - Postgres driver
- **PyJWT** - Authentication
- **Flasgger** - Swagger UI for API documentation

### Frontend

- **React 18** - UI framework
- **Vite** - Build tool
- **React Router** - Client-side routing
- **Tailwind CSS** - Styling
- **Lucide React** - Icons
- **Axios** - HTTP client

## Prerequisites

- Python 3.10+
- Node.js (v14 or higher)
Postgres (for production) or SQLite (local dev). See `backend-flask/config.py` for `DATABASE_URL` fallback.

## Installation

### 1. Install Python dependencies

```bash
cd backend-flask
pip install -r requirements.txt
```

### 2. Install frontend dependencies

```bash
cd frontend
npm install
```

### 3. Initialize the database (local/dev)

Run migrations to create the schema (uses `DATABASE_URL` or sqlite fallback):

```bash
cd backend-flask
set FLASK_APP=app.py
flask db init   # only once
flask db migrate -m "Initial"
flask db upgrade
```

## Running the Application

### Start Backend

```bash
cd backend-flask
python app.py
```

Server runs on http://localhost:5001

### Start Frontend

```bash
cd frontend
npm run dev
```

Client runs on http://localhost:5173

## Live Deployment

- **Production site:** https://back-to-way.onrender.com/
- **Swagger UI:** https://back-to-way.onrender.com/apidocs/
- **Swagger aliases:** https://back-to-way.onrender.com/swagger and https://back-to-way.onrender.com/docs

The site root now redirects to Swagger UI in production.

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (protected)

### Items

- `GET /api/items` - Get all items
- `GET /api/items/search` - Search items (filters: keyword, category, type)
- `GET /api/items/:id` - Get item by ID
- `POST /api/items` - Create new item (protected, multipart/form-data)
- `PUT /api/items/:id` - Update item (protected)
- `DELETE /api/items/:id` - Delete item (protected)
- `PATCH /api/items/:id/resolve` - Toggle item status (protected)
- `GET /api/items/my-items` - Get user's items (protected)

## Swagger Documentation

The backend also exposes interactive API docs through Swagger UI at `/apidocs/`.
Use that page to explore request payloads and test endpoints while the backend is running.

### Swagger Authorize

- **How to authorize:** Click the **Authorize** button on the Swagger UI, then paste the full Authorization header value including the "Bearer " prefix (for example: `Bearer <token>`). Swagger requires the header exactness.
- **Tip:** If a protected operation still returns 401 after authorizing, reload the docs page; the Flasgger UI sometimes needs a refresh to attach the header to subsequent requests.

## Project Structure

```
lostandfound/
├── backend-flask/               # Backend (Flask)
│   ├── routes/
│   │   ├── auth_routes.py      # Auth endpoints
│   │   └── item_routes.py      # Item endpoints
│   ├── middleware/
│   │   └── auth.py             # JWT token verification
│   ├── models.py               # SQLAlchemy models
│   ├── config.py               # App configuration
│   ├── app.py                  # Main server file
│   ├── uploads/                # File storage directory
│   └── requirements.txt
│
├── frontend/                    # Frontend (React + Vite)
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── Browse.jsx
│   │   │   ├── PostReport.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Login.jsx
│   │   │   └── Register.jsx
│   │   ├── components/
│   │   │   ├── Navigation.jsx
│   │   │   └── ItemCard.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── api/
│   │   │   └── axios.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── package.json
│
├── package.json                 # Root package.json
└── README.md
```

## Database Schema (SQL)

Users table (`user`): id, name, email (unique), password_hash, phone, created_at, updated_at

Items table (`item`): id, user_id (FK -> user.id), type (Lost/Found), title, description, category, incident_date, image_path, tracking_id (unique), status (Active/Resolved), created_at, updated_at

## Error Handling

- All API calls wrapped in try/catch blocks
- User-friendly error messages returned as JSON
- JWT validation on protected routes
- File upload validation (type and size)

## Troubleshooting

### Database Connection Error

- Ensure `DATABASE_URL` is configured in production (Render/Heroku/wherever).
- For Postgres on Render, provision a managed Postgres and set `DATABASE_URL` in the service env vars.

### Port Already in Use

- Backend port 5001: `netstat -ano | findstr :5001`
- Frontend port 5173: Kill the process using that port

### File Upload Issues

- Check `backend-flask/uploads/` directory exists
- Verify file size is under 5MB
- Ensure file is a valid image format

### CORS Errors

- Verify frontend URL matches CORS configuration in `app.py`

### Swagger UI Not Loading

- Confirm the backend has been redeployed with the latest code
- Open `/apidocs/`, `/swagger`, or `/docs`
- Verify `flasgger` is installed from `backend-flask/requirements.txt`

### Login or Items Return 503

-- Set `DATABASE_URL` on Render to a reachable Postgres instance
-- The app falls back to `sqlite:///dev.db` when no `DATABASE_URL` is provided (not for production)

## License

ISC
