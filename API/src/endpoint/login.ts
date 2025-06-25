import { Request, Response } from 'express';
import { supabase } from '../supabase/client';

export async function loginHandler(req: Request, res: Response): Promise<void> {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ success: false, message: 'Email and password required' });
      return;
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error || !data.user || !data.session) {
      res.status(401).json({ success: false, message: error?.message || 'Login failed' });
      return;
    }

    const token = data.session.access_token;
    const username = data.user.email ?? 'unknown';
    const maxAge = 60 * 60; // 1 hour
    const isProd = process.env.NODE_ENV === 'production';

    // First: Clear existing token cookie
    res.setHeader('Set-Cookie', [
      `token=; Path=/; HttpOnly; Max-Age=0; ${isProd ? 'Secure;' : ''} SameSite=${isProd ? 'Strict' : 'Lax'}`,
    ]);

    // Set only the token cookie
    res.setHeader('Set-Cookie', [
      `token=${token}; Path=/; HttpOnly; ${isProd ? 'Secure;' : ''} SameSite=${isProd ? 'Strict' : 'Lax'}; Max-Age=${maxAge}`,
    ]);


    res.status(200).json({
      success: true,
      user: data.user,
      username, // so that client side can set username to localstorage
      session: data.session,
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
}
