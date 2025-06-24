import { Request, Response } from 'express';

export function logoutHandler(req: Request, res: Response): void {
  res.setHeader('Set-Cookie', [
    'token=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0',
    'username=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0',
  ]);

  res.status(200).json({ success: true, message: 'Logged out' });
}
