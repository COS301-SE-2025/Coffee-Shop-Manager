import { Request, Response } from 'express';
import { supabase } from '../supabase/client';

export async function checkTokenHandler(req: Request, res: Response): Promise<void> {
  try {
    const token = req.cookies?.token;

    if (!token) {
      res.status(401).json({ valid: false, message: 'Missing token' });
      return;
    }

    // Validate the token with Supabase
    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data.user) {
      res.status(401).json({ valid: false, message: error?.message || 'Invalid token' });
      return;
    }

    // Token is valid
    res.status(200).json({ valid: true, user: data.user });
  } catch (err) {
    console.error('Token check error:', err);
    res.status(500).json({ valid: false, message: 'Server error' });
  }
}
