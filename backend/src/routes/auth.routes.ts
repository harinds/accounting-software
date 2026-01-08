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
  const { email, password, fullName, organizationName } = req.body;

  if (!email || !password) {
    throw new AppError('Email and password are required', 400);
  }

  // Register user with Supabase Auth
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName || email.split('@')[0]
      }
    }
  });

  if (error) {
    logger.error('Registration failed', { error: error.message, email });
    throw new AppError(error.message, 400);
  }

  if (!data.user) {
    throw new AppError('User creation failed', 500);
  }

  // Create user record in users table
  const { error: userError } = await supabase
    .from('users')
    .insert({
      id: data.user.id,
      email: data.user.email,
      full_name: fullName || email.split('@')[0]
    });

  if (userError) {
    logger.error('User record creation failed', { error: userError.message, userId: data.user.id });
  }

  // Auto-create organization for new user
  const orgName = organizationName || `${fullName || email.split('@')[0]}'s Organization`;
  const { data: orgData, error: orgError } = await supabase
    .from('organizations')
    .insert({
      name: orgName
    })
    .select()
    .single();

  if (orgError) {
    logger.error('Organization creation failed', { error: orgError.message, userId: data.user.id });
  }

  // Link user to organization
  if (orgData) {
    const { error: linkError } = await supabase
      .from('user_organizations')
      .insert({
        user_id: data.user.id,
        organization_id: orgData.id,
        role: 'owner'
      });

    if (linkError) {
      logger.error('User-organization link failed', { error: linkError.message, userId: data.user.id });
    }
  }

  logger.info('User registered with organization', {
    email,
    userId: data.user.id,
    organizationId: orgData?.id
  });

  res.status(201).json({
    message: 'Registration successful',
    user: {
      id: data.user.id,
      email: data.user.email,
      fullName: fullName || email.split('@')[0]
    },
    organization: orgData ? {
      id: orgData.id,
      name: orgData.name
    } : null
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

  // Fetch user's organizations
  const { data: userOrgs, error: orgError } = await supabase
    .from('user_organizations')
    .select('organization_id, role, organizations(*)')
    .eq('user_id', data.user.id);

  if (orgError) {
    logger.error('Failed to fetch user organizations', { error: orgError.message, userId: data.user.id });
  }

  // Get the primary organization (first one, or owner role)
  const primaryOrg = userOrgs?.find(uo => uo.role === 'owner') || userOrgs?.[0];

  logger.info('User logged in', {
    email,
    userId: data.user.id,
    organizationId: primaryOrg?.organization_id
  });

  res.json({
    message: 'Login successful',
    user: {
      id: data.user.id,
      email: data.user.email
    },
    organization: primaryOrg ? {
      id: primaryOrg.organization_id,
      name: (primaryOrg.organizations as any)?.name,
      role: primaryOrg.role
    } : null,
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
