import { Request, Response } from 'express';
import { supabase } from '../supabase/client';

export async function getUserProfileHandler(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.params.id;

    if (!userId) {
      res.status(400).json({ error: 'User ID is required in the URL' });
      return;
    }

    // Fetch profile from user_profiles table
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (profileError) {
      throw profileError;
    }

    if (!profile) {
      res.status(404).json({ success: false, message: 'Profile not found' });
      return;
    }

    res.status(200).json({ success: true, profile });
  } catch (error: any) {
    console.error('Get user profile error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
