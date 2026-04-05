# Lumina Finance

A modern personal finance dashboard built with React and Tailwind CSS. Track transactions, visualize spending, and manage your financial overview — with full dark/light mode support.

**Live Demo:** https://lumina-finance-flax.vercel.app/

---

## Features

- **Dashboard Overview** — Summary cards for balance, income, and total spending
- **Transaction Management** — Add and delete transactions with role-based access control
- **Cash Flow Analytics** — Area chart visualization of transaction history
- **Dark / Light Mode** — Toggle between themes; preference is persisted via local storage
- **Role-Based Access** — Admin users can add/delete transactions; viewers have read-only access
- **Activity Feed** — Live sidebar feed showing recent transactions
- **Responsive Design** — Optimized for desktop and large screens

---

## Tech Stack

- **React 18** — UI library with hooks and context
- **Vite** — Build tool and development server
- **Tailwind CSS v4** — Utility-first CSS framework
- **Zustand** — Lightweight global state management with `persist` middleware
- **Recharts** — Composable charting library for the analytics view
- **Lucide React** — Icon library

---

## Getting Started

### Prerequisites

- Node.js v18 or higher
- npm

### Installation

```bash
# Clone the repository
git clone https://github.com/PrajaktaSarkhel/lumina-finance.git

# Navigate into the project
cd lumina-finance

# Install dependencies
npm install

# Start the development server
npm run dev
```

The app will be available at `http://localhost:5173`.

### Build for Production

```bash
npm run build
```

---

## Project Structure

```
lumina-finance/
├── public/
├── src/
│   ├── assets/           # Logo and static images
│   ├── App.jsx           # Main application component and all sub-pages
│   ├── store.js          # Zustand global state (transactions, dark mode, role)
│   ├── main.jsx          # React entry point
│   └── index.css         # Tailwind CSS v4 imports and global styles
├── index.html
├── tailwind.config.js
├── vite.config.js
└── package.json
```

---

## State Management

Global state is managed with **Zustand** and persisted to `localStorage` under the key `lumina-storage`. The store holds:

- `transactions` — list of all income and expense records
- `darkMode` — boolean controlling the active theme
- `role` — either `'admin'` (can add/delete) or `'viewer'` (read-only)

---

## Dark Mode

Dark mode is implemented using Tailwind CSS v4's class-based `@variant dark` strategy. Toggling the button in the header updates the Zustand `darkMode` state, which triggers a `useEffect` that adds or removes the `dark` class on the `<html>` element. The preference persists across sessions via Zustand's `persist` middleware.

---

## Author

**Prajakta Sarkhel** — [@PrajaktaSarkhel](https://github.com/PrajaktaSarkhel)

---

## License

This project is open source and available under the [MIT License](LICENSE).