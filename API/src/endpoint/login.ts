import { Request, Response } from 'express';
import { supabase } from '../supabase/client';
import type { Session } from '@supabase/supabase-js';

export async function loginHandler(req: Request, res: Response): Promise<void> {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ success: false, message: 'Email and password required' });
      return;
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    // console.log('🧪 Supabase login data:', data);


    if (error || !data.user || !data.session) {
      res.status(401).json({ success: false, message: error?.message || 'Login failed' });
      return;
    }

    const token = data.session.access_token;
    const username = data.user.email ?? 'unknown';
    const maxAge = 60 * 60; // 1 hour

    res.setHeader('Set-Cookie', [
      `token=${token}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${maxAge}`,
      `username=${encodeURIComponent(username)}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${maxAge}`
    ]);

    res.status(200).json({
      success: true,
      user: data.user,
      session:data.session,
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
}
