import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { supabase, supabaseAdmin } from '../config/supabase';
import { AppError } from './errorHandler';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role?: string;
  };
  organizationId?: string;
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('No token provided', 401);
    }

    const token = authHeader.substring(7);

    // Verify token with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      throw new AppError('Invalid or expired token', 401);
    }

    // Attach user to request
    req.user = {
      id: user.id,
      email: user.email!,
      role: user.user_metadata?.role
    };

    next();
  } catch (error) {
    if (error instanceof AppError) {
      next(error);
    } else {
      next(new AppError('Authentication failed', 401));
    }
  }
};

export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError('Not authenticated', 401));
    }

    if (roles.length && !roles.includes(req.user.role || '')) {
      return next(new AppError('Not authorized to access this resource', 403));
    }

    next();
  };
};

// Middleware to check organization access
export const checkOrganizationAccess = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const organizationId = req.params.organizationId || req.body.organizationId || req.query.organizationId as string;

    if (!organizationId) {
      throw new AppError('Organization ID is required', 400);
    }

    // Check if user has access to this organization (use admin client to bypass RLS)
    const { data, error } = await supabaseAdmin
      .from('user_organizations')
      .select('*')
      .eq('user_id', req.user!.id)
      .eq('organization_id', organizationId)
      .single();

    if (error || !data) {
      throw new AppError('Access denied to this organization', 403);
    }

    req.organizationId = organizationId;
    next();
  } catch (error) {
    next(error);
  }
};
