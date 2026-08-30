import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import transactionsRoutes from './routes/transactions.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Root API Status Page
app.get('/', (req, res) => {
  res.setHeader('Content-Type', 'text/html');
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>Lumina Finance API</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0b0f19; color: #f8fafc; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; }
        .card { background: #131b2e; border: 1px solid #1e293b; padding: 2.5rem; border-radius: 1.5rem; max-width: 480px; text-align: center; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5); }
        h1 { color: #38bdf8; margin-top: 0; font-size: 1.75rem; }
        p { color: #94a3b8; font-size: 0.95rem; line-height: 1.6; }
        .badge { display: inline-block; background: rgba(34, 197, 94, 0.15); color: #4ade80; border: 1px solid rgba(34, 197, 94, 0.3); padding: 0.25rem 0.75rem; border-radius: 9999px; font-weight: 700; font-size: 0.8rem; margin-bottom: 1rem; }
        .btn { display: inline-block; background: #2563eb; color: white; text-decoration: none; padding: 0.75rem 1.5rem; border-radius: 0.75rem; font-weight: 700; font-size: 0.9rem; margin-top: 1rem; transition: background 0.2s; }
        .btn:hover { background: #1d4ed8; }
      </style>
    </head>
    <body>
      <div class="card">
        <span class="badge">● API Server Active</span>
        <h1>Lumina Finance API</h1>
        <p>The backend REST API server is up and running on port <code>5000</code> with SQLite database storage.</p>
        <p>To access the user interface dashboard, open the React application:</p>
        <a href="http://localhost:5173" class="btn">Open Lumina Dashboard (Port 5173) &rarr;</a>
      </div>
    </body>
    </html>
  `);
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionsRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'lumina-finance-api',
    database: 'SQLite (lumina.db)',
    timestamp: new Date().toISOString() 
  });
});

// Start server
const server = app.listen(PORT, () => {
  console.log(`🚀 Lumina Finance Server running on http://localhost:${PORT}`);
  console.log(`📱 Access Frontend Dashboard at http://localhost:5173`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use by another process.`);
  } else {
    console.error('Server error:', err);
  }
});
