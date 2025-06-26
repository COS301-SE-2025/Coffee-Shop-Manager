import { Request, Response, NextFunction } from 'express';
import { supabase } from '../supabase/client';

export async function authMiddleware(req: Request, res: Response, next: NextFunction): Promise<void> {
  // extract token from cookie or header
  const token = req.cookies?.token || req.headers.authorization?.split(' ')[1];

  if (!token) {
    res.status(401).json({ error: 'Missing auth token' });
    return;
  }

  const { data, error } = await supabase.auth.getUser(token);

  if (error || !data.user) {
    res.status(401).json({ error: 'Invalid token' });
    return;
  }

  // Attach user info to the request object
  (req as any).user = data.user;
  next();
}
