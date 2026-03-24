/**
 * Configuration for Cross-Origin Resource Sharing.
 * - Pulls allowed origins from environment variables.
 * - Configured to support credentialed requests (cookies/headers).
 * @type {import('cors').CorsOptions}
 */
const corsOptions = {
  // Parse comma-separated origins from .env or fallback to local
  origin: (origin, callback) => {
    const allowed = process.env.CORS_ALLOWED_ORIGINS?.split(',') || [];

    // Allow requests with no origin (like mobile apps or curl) or matched origins
    if (!origin || allowed.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD'],
  credentials: true,
  optionsSuccessStatus: 200,
};

export default corsOptions;
