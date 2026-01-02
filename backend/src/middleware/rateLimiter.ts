import rateLimit from 'express-rate-limit';

// More lenient rate limiting for development
const isDevelopment = process.env.NODE_ENV !== 'production';

export const rateLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes default
  max: isDevelopment ? 1000 : parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'), // 1000 for dev, 100 for prod
  message: 'Too many requests from this IP, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      error: 'Too many requests, please try again later'
    });
  }
});

// Stricter rate limiting for authentication endpoints
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isDevelopment ? 500 : 20, // 500 for dev, 20 for production
  message: 'Too many authentication attempts, please try again later'
});
