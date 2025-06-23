import { Request, Response } from 'express';
import { supabase } from '../supabase/client';

export async function loginHandler(req: Request, res: Response) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password required' });
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error || !data.user) {
      return res.status(401).json({ success: false, message: error?.message || 'Login failed' });
    }

    return res.status(200).json({
      success: true,
      user: data.user,
      session: data.session,
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
}
