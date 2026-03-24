import 'dotenv/config';
import express from 'express';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import './config/passport.js';
import {
  configureMiddleware,
  configureErrorHandling,
} from './middleware/app/app.middleware.js';
import indexRouter from './routes/index.routes.js';

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// View engine setup
app.set('views', path.join(__dirname, '..', 'views'));
app.set('view engine', 'ejs');

// Run global middleware stack
configureMiddleware(app);

// Mount main application routes
app.use('/', indexRouter);

// Attach error handlers last
configureErrorHandling(app);

// Start server listener
const PORT = process.env.SERVER_PORT || 3000;
app.listen(PORT, (error) => {
  if (error) throw error;
  console.log(
    `Server started on port ${PORT}.\nView live in http://localhost:${PORT}/`,
  );
});
