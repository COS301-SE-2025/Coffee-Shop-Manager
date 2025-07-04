import { Request, Response } from 'express';
import { supabase } from '../supabase/client';

export async function signupHandler(req: Request, res: Response): Promise<void> {
  try {
    const { email, password, username } = req.body;

    if (!email || !password || !username) {
      res.status(400).json({ success: false, message: 'Email, password and username are required' });
      return;
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          role: 'user',
          display_name: username,
        }
      }
    });

    if (error) {
      res.status(400).json({ success: false, message: error.message });
      return;
    }

    res.status(201).json({
      success: true,
      message: 'User registered successfully.',
      user: data.user,
    });
    return;
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
    return;
  }
}
