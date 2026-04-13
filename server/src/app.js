import 'dotenv/config';
import express from 'express';
import {
  configureErrorHandling,
  configureMiddleware,
} from './middleware/app/app.middleware.js';
import indexRouter from './routes/index.routes.js';

const app = express();

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
  console.log(`Server started on port ${PORT}.`); // eslint-disable-line no-console
});
