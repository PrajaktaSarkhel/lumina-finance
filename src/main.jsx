import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useStore } from './store';
import './index.css';
import App from './App.jsx';
import Login from './pages/Login.jsx';

function ProtectedRoute({ children }) {
  const isLoggedIn = useStore((s) => s.isLoggedIn);
  return isLoggedIn ? children : <Navigate to="/login" replace />;
}

function Root() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <App />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Root />
  </StrictMode>
);