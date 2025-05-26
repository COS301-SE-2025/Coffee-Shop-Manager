import { NextRequest, NextResponse } from 'next/server';
import { Client } from 'pg';

// POST /api/login - Authenticates a user based on email and password
export async function POST(req: NextRequest) {
  try {
    

    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ success: false, message: 'Missing email or password' }, { status: 400 });
    }

    const client = new Client({
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });

    await client.connect();

    const query = 'SELECT * FROM users WHERE email = $1 AND password = $2';
    const result = await client.query(query, [email, password]);

    await client.end();

    if (result.rows.length === 1) {
      const user = result.rows[0];
      return NextResponse.json({ success: true, user });
    } else {
      return NextResponse.json({ success: false, message: 'Invalid credentials' }, { status: 401 });
    }
  } catch (err) {
    console.error('[LOGIN_API_ERROR]', err);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
