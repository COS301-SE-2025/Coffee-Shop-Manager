import { Request, Response } from 'express';

export function logoutHandler(req: Request, res: Response) {
  res.cookie('access_token', '', {
    httpOnly: true,
    secure: true,
    maxAge: 0,
    path: '/',
  });

  res.cookie('refresh_token', '', {
    httpOnly: true,
    secure: true,
    maxAge: 0,
    path: '/',
  });

  res.status(200).json({ success: true, message: 'Logged out successfully' });
}
