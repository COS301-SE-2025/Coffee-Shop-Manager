import { Request, Response } from 'express';
import { supabase } from '../supabase/client';

export async function signupHandler(req: Request, res: Response) {
  try {
    const { email, password, username } = req.body;

    if (!email || !password || !username) {
      return res.status(400).json({ success: false, message: 'Email, password and username are required' });
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
      return res.status(400).json({ success: false, message: error.message });
    }

    return res.status(201).json({
      success: true,
      message: 'User registered successfully.',
      user: data.user,
    });
  } catch (err) {
    console.error('Signup error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
}
