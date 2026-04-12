import cors from 'cors';
import express from 'express';
import corsOptions from '../../config/corsOptions.js';
import { globalErrorHandler } from '../error/error.middleware.js';

/**
 * Configures global application middleware.
 * - CORS and JSON body parsing only.
 * - Passport, cookie-parser, static assets, and EJS removed — these
 *   concerns are now handled client-side via Supabase.
 * @param {import('express').Express} app
 * @returns {void}
 */
export const configureMiddleware = (app) => {
  app.use(cors(corsOptions));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
};

/**
 * Global error handling setup.
 * @param {import('express').Express} app
 * @returns {void}
 */
export const configureErrorHandling = (app) => {
  app.use(globalErrorHandler);
};
