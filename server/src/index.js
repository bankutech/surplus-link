import express from 'express';
import cors from 'cors';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import apiRoutes from './routes/api.js';
import { errorHandler } from './middleware/errorHandler.js';
import { initializeDatabase } from './db/connection.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const clientDist = path.resolve(__dirname, '../../client/dist');

const app = express();
const PORT = process.env.PORT || 5001;

// Middlewares
app.use(cors());
app.use(express.json());

// Initialize SQLite Schema
initializeDatabase();

// Mount Routes
app.use('/api', apiRoutes);

// Serve built production frontend if present
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.resolve(clientDist, 'index.html'));
  });
}

// Global Error Handler
app.use(errorHandler);

const server = app.listen(PORT, () => {
  console.log(`SurplusLink Server running on http://localhost:${PORT}`);
});

export default app;
