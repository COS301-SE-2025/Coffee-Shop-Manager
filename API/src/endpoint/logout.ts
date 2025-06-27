import { Request, Response } from 'express';

export function logoutHandler(req: Request, res: Response): void {
  const cookies = req.cookies;

  if (cookies) {
    const clearedCookies = Object.keys(cookies).map((cookieName) => {
      return `${cookieName}=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0`;
    });

    res.setHeader('Set-Cookie', clearedCookies);
  }

  res.status(200).json({ success: true, message: 'Logged out' });
}
