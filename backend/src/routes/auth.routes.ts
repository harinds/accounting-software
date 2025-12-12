import { Router } from 'express';
import { supabase } from '../config/supabase';
import { asyncHandler, AppError } from '../middleware/errorHandler';
import { authRateLimiter } from '../middleware/rateLimiter';
import logger from '../utils/logger';

const router = Router();

// Apply strict rate limiting to auth routes
router.use(authRateLimiter);

/**
 * Register new user
 * POST /api/auth/register
 */
router.post('/register', asyncHandler(async (req, res) => {
  const { email, password, fullName } = req.body;

  if (!email || !password) {
    throw new AppError('Email and password are required', 400);
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName
      }
    }
  });

  if (error) {
    logger.error('Registration failed', { error: error.message, email });
    throw new AppError(error.message, 400);
  }

  logger.info('User registered', { email, userId: data.user?.id });

  res.status(201).json({
    message: 'Registration successful',
    user: {
      id: data.user?.id,
      email: data.user?.email
    }
  });
}));

/**
 * Login user
 * POST /api/auth/login
 */
router.post('/login', asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new AppError('Email and password are required', 400);
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    logger.error('Login failed', { error: error.message, email });
    throw new AppError('Invalid credentials', 401);
  }

  logger.info('User logged in', { email, userId: data.user.id });

  res.json({
    message: 'Login successful',
    user: {
      id: data.user.id,
      email: data.user.email
    },
    session: {
      access_token: data.session?.access_token,
      refresh_token: data.session?.refresh_token,
      expires_at: data.session?.expires_at
    }
  });
}));

/**
 * Refresh access token
 * POST /api/auth/refresh
 */
router.post('/refresh', asyncHandler(async (req, res) => {
  const { refresh_token } = req.body;

  if (!refresh_token) {
    throw new AppError('Refresh token is required', 400);
  }

  const { data, error } = await supabase.auth.refreshSession({
    refresh_token
  });

  if (error) {
    logger.error('Token refresh failed', { error: error.message });
    throw new AppError('Invalid refresh token', 401);
  }

  res.json({
    session: {
      access_token: data.session?.access_token,
      refresh_token: data.session?.refresh_token,
      expires_at: data.session?.expires_at
    }
  });
}));

/**
 * Logout user
 * POST /api/auth/logout
 */
router.post('/logout', asyncHandler(async (req, res) => {
  const { error } = await supabase.auth.signOut();

  if (error) {
    logger.error('Logout failed', { error: error.message });
    throw new AppError('Logout failed', 500);
  }

  res.json({ message: 'Logout successful' });
}));

export default router;
