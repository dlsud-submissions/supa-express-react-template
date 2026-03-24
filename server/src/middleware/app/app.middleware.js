import express from 'express';
import cors from 'cors';
import passport from 'passport';
import cookieParser from 'cookie-parser';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import corsOptions from '../../config/corsOptions.js';
import { globalErrorHandler } from '../error/error.middleware.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Configures global application middleware.
 * - Sets up security via CORS and request parsing.
 * - Initializes authentication and static asset serving.
 * - Inject user data into all response locals for view engine access.
 * @param {import('express').Express} app - The Express application instance.
 * @returns {void}
 */
export const configureMiddleware = (app) => {
  // Setup cross-origin resource sharing
  app.use(cors(corsOptions));

  // Enable public access to static files
  const assetsPath = path.join(__dirname, '..', '..', '..', 'public');
  app.use(express.static(assetsPath));

  // Setup body and cookie parsing
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  // Attach passport authentication system
  app.use(passport.initialize());

  // Middleware to expose passport user to templates/views
  app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    next();
  });
};

/**
 * Global error handling setup.
 * - Catches all upstream errors in the middleware chain.
 * - Standardizes error responses with status codes and messages.
 * @param {import('express').Express} app - The Express application instance.
 * @returns {void}
 */
export const configureErrorHandling = (app) => {
  // Final middleware to catch and format application errors
  app.use(globalErrorHandler);
};
