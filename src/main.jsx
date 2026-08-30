import { StrictMode, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useStore } from './store';
import './index.css';
import App from './App.jsx';
import Login from './pages/Login.jsx';

function ProtectedRoute({ children }) {
  const { isLoggedIn, checkAuth } = useStore();

  useEffect(() => {
    checkAuth();
  }, []);

  return isLoggedIn ? children : <Navigate to="/login" replace />;
}

function Root() {
  const { checkAuth } = useStore();

  useEffect(() => {
    checkAuth();
  }, []);

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