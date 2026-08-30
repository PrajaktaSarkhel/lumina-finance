# 💡 Lumina Finance

A modern, full-stack personal finance dashboard built with **React**, **Tailwind CSS v4**, **Node.js/Express**, and **SQLite**. 

Lumina Finance provides a complete, genuine authentication system where user credentials are encrypted and stored in a real database, with per-user data isolation for financial transactions and analytics.

---

## ✨ Features

- 🔐 **Genuine Authentication System**
  - Secure user registration and sign-in.
  - Passwords cryptographically hashed using **bcrypt** (10 salt rounds).
  - Stateless session authorization using **JSON Web Tokens (JWT)**.
- 🗄️ **Persistent Database Storage (SQLite)**
  - Local SQLite database (`lumina.db`) for storing users and transactions.
  - Per-user data isolation — each account accesses only its own financial records.
  - Cascading deletes and indexed relational schemas.
- 📊 **Financial Dashboard & Cash Flow Analytics**
  - Summary metrics for current balance, income, and total expenses.
  - Interactive cash flow area charts powered by **Recharts**.
  - Dynamic spending behavior breakdowns and financial health score.
- 💳 **Transaction Management**
  - Full CRUD operations with instant database synchronization.
  - Add income or expense records with category, amount, and custom notes.
  - Real-time search and category filtering.
- 🛡️ **Role-Based Access Control (RBAC)**
  - **Admin**: Full permissions to create, edit, and delete transactions.
  - **Viewer**: Read-only access for auditing and reviewing analytics.
- 🌓 **Dark / Light Mode**
  - Seamless theme toggle with Tailwind CSS v4.
- 📱 **Activity Feed & Modern UI**
  - Responsive layout with collapsible feeds, glassmorphism cards, and smooth micro-animations.

---

## 🛠️ Tech Stack

### Frontend
- **React 19** — Modern component-driven UI
- **Vite** — Fast frontend build tool and development server with API proxy
- **Tailwind CSS v4** — Modern styling and dark mode styling
- **Zustand** — Global client state management
- **Recharts** — Responsive charting and financial visualizations
- **Lucide React** — Clean, modern iconography

### Backend & Database
- **Node.js & Express.js** — REST API server running on port `5000`
- **SQLite (`better-sqlite3`)** — Fast, embedded relational database (`lumina.db`)
- **bcryptjs** — Industry-standard password hashing
- **jsonwebtoken (JWT)** — Token-based API authentication middleware
- **cors & dotenv** — Cross-Origin Resource Sharing and environment configuration
- **concurrently** — Concurrently executes backend and frontend dev processes

---

## 🗃️ Database Schema

### `users` Table
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | INTEGER | PRIMARY KEY AUTOINCREMENT | Unique user identifier |
| `name` | TEXT | NOT NULL | User's full name |
| `email` | TEXT | UNIQUE NOT NULL COLLATE NOCASE | User's email address |
| `password_hash` | TEXT | NOT NULL | bcrypt password hash |
| `role` | TEXT | NOT NULL DEFAULT 'admin' | Role (`admin` or `viewer`) |
| `created_at` | DATETIME | DEFAULT CURRENT_TIMESTAMP | Registration timestamp |

### `transactions` Table
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | INTEGER | PRIMARY KEY AUTOINCREMENT | Unique transaction identifier |
| `user_id` | INTEGER | NOT NULL REFERENCES users(id) | Foreign key to `users` table |
| `date` | TEXT | NOT NULL | Transaction date (`YYYY-MM-DD`) |
| `amount` | REAL | NOT NULL | Monetary amount |
| `category` | TEXT | NOT NULL | Category (e.g. Salary, Rent, Food) |
| `type` | TEXT | CHECK(type IN ('income', 'expense')) | Transaction type |
| `note` | TEXT | NULL | Optional description |
| `created_at` | DATETIME | DEFAULT CURRENT_TIMESTAMP | Record creation timestamp |

---

## 🔌 API Reference

### Authentication (`/api/auth`)
- `POST /api/auth/register` — Create a new user account with hashed password and return JWT.
- `POST /api/auth/login` — Validate credentials against database hash and return JWT.
- `GET /api/auth/me` — Verify active token and retrieve user profile (*Protected*).
- `PATCH /api/auth/role` — Update user role between `admin` and `viewer` (*Protected*).

### Transactions (`/api/transactions`)
- `GET /api/transactions` — Fetch all transactions for the authenticated user (*Protected*).
- `POST /api/transactions` — Insert a new transaction associated with user ID (*Admin only*).
- `DELETE /api/transactions/:id` — Delete transaction by ID (*Admin only*).
- `POST /api/transactions/reset` — Reset user's transaction data back to default starter set (*Protected*).

### System (`/api`)
- `GET /api/health` — Returns server and database health status.

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- `npm`

### 1. Installation
Clone the repository and install all dependencies:
```bash
git clone https://github.com/PrajaktaSarkhel/lumina-finance.git
cd lumina-finance
npm install
```

### 2. Running the Application

You can start **both the backend API and frontend UI** simultaneously with a single command:
```bash
npm run dev:all
```

Alternatively, you can run them in separate terminal windows:
```bash
# Terminal 1: Start Express API Backend (Port 5000)
npm run server

# Terminal 2: Start React Frontend (Port 5173)
npm run dev
```

### 3. Open in Browser
- **Frontend Dashboard (Main App)**: [http://localhost:5173](http://localhost:5173)
- **Backend API Status**: [http://localhost:5000](http://localhost:5000)

---

## 📦 Production Build

To create an optimized production build of the frontend:
```bash
npm run build
```

The output bundle will be generated in the `dist/` directory.

---

## 📁 Project Structure

```
lumina-finance/
├── server/                   # Backend Express server & database
│   ├── db.js                 # SQLite database initialization & schema
│   ├── index.js              # Express server entry point (Port 5000)
│   ├── middleware/
│   │   └── auth.js           # JWT authentication middleware
│   └── routes/
│       ├── auth.js           # Registration, login & profile endpoints
│       └── transactions.js   # Transactions CRUD endpoints
├── src/                      # Frontend React application
│   ├── api/
│   │   └── client.js         # API client & fetch interceptors
│   ├── assets/               # Branding assets & icons
│   ├── pages/
│   │   └── Login.jsx         # Sign in & Account creation UI
│   ├── App.jsx               # Dashboard & sub-pages
│   ├── store.js              # Zustand store synced with database API
│   ├── main.jsx              # Application router & protected routes
│   └── index.css             # Tailwind CSS & custom styles
├── lumina.db                 # SQLite database file (created automatically)
├── vite.config.js            # Vite configuration with /api proxy
├── tailwind.config.js        # Tailwind CSS configuration
└── package.json              # Dependencies and scripts
```

---

## 👤 Author

**Prajakta Sarkhel** — [@PrajaktaSarkhel](https://github.com/PrajaktaSarkhel)

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).