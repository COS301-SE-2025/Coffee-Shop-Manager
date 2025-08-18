import { Request, Response, NextFunction } from 'express';
import { supabase } from '../supabase/client';
import jwt from 'jsonwebtoken';

export async function authMiddleware(req: Request, res: Response, next: NextFunction) {
  let accessToken = req.cookies?.access_token;
  const refreshToken = req.cookies?.refresh_token;

  //For mobile
  if (!accessToken && req.headers.authorization) {
    const parts = req.headers.authorization.split(' ');
    if (parts.length === 2 && parts[0] === 'Bearer') {
      accessToken = parts[1];
    }
  }

  if (!accessToken && !refreshToken) {
    return res.status(401).json({ error: 'Missing token' });
  }

  let needsRefresh = false;

  if (accessToken) {
    const decoded: any = jwt.decode(accessToken);
    const now = Math.floor(Date.now() / 1000);

    // If token is expired or about to expire in the next 30s
    if (!decoded || !decoded.exp || decoded.exp < now + 30) {
      needsRefresh = true;
    }
  } else {
     // No access token, must refresh
    needsRefresh = true;
  }

  if (needsRefresh) {
    if (!refreshToken) {
      return res.status(401).json({ error: 'No refresh token available' });
    }

    // Refresh the session
    const { data, error } = await supabase.auth.setSession({
      access_token: "",
      refresh_token: refreshToken
    });

    if (error || !data.session) {
      return res.status(401).json({ error: 'Failed to refresh token' });
    }

    // Update tokens
    accessToken = data.session.access_token;

    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: true,
      maxAge: 60 * 60 * 1000
    });
    res.cookie('refresh_token', data.session.refresh_token, {
      httpOnly: true,
      secure: true,
      // Store refresh token forever to preserve logged in state (unless cleared by logout)
      maxAge: 10 * 365 * 24 * 60 * 60 * 1000      // 10 years [this is probably not ideal]
    });
  }

  // Validate the (refreshed) access token
  const { data: userData, error: userError } = await supabase.auth.getUser(accessToken);
  if (userError || !userData.user) {
    return res.status(401).json({ error: 'Invalid token' });
  }

  // Attach user to request
  (req as any).user = userData.user;
  next();
}
