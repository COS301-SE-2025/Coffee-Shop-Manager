import { NextRequest, NextResponse } from 'next/server';
import { Client } from 'pg';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json(); // ✅ Read request body
    console.log('[RECEIVED BODY]', body);

    const { action, username, email, password } = body;

    if (!username || !action || !email || !password) {
      console.warn('[VALIDATION FAILED] Missing fields');
      return NextResponse.json({ success: false, message: 'Missing fields' }, { status: 400 });
    }

    const client = new Client({
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });

    console.log('[DB CONNECTING]');
    await client.connect();
    console.log('[DB CONNECTED]');

    if (action === 'login') {
      console.log('[LOGIN ATTEMPT]', email);
      const query = 'SELECT * FROM users WHERE email = $1 AND password = $2';
      const result = await client.query(query, [email, password]);
      await client.end();

      if (result.rows.length === 1) {
        console.log('[LOGIN SUCCESS]', result.rows[0]);
        return NextResponse.json({ success: true, user: result.rows[0] }, { status: 200 });
      } else {
        console.warn('[LOGIN FAILED] Invalid credentials');
        return NextResponse.json({ success: false, message: 'Invalid credentials' }, { status: 401 });
      }
    }

    if (action === 'username') {
      console.log('[USERNAME RETRIEVAL] Request received for email:', email);

      const query = 'SELECT username FROM users WHERE email = $1';
      const result = await client.query(query, [email]);

      await client.end();

      if (result.rows.length === 1) {
        console.log('[USERNAME RETRIEVED]', result.rows[0].username);
        return NextResponse.json({ success: true, username: result.rows[0].username }, { status: 200 });
      } else {
        console.warn('[USERNAME FAILED] No user with that email');
        return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
      }
    }

    if (action === 'register') {
      console.log('[REGISTER ATTEMPT]', email);

      const existing = await client.query('SELECT * FROM users WHERE email = $1', [email]);
      if (existing.rows.length > 0) {
        await client.end();
        console.warn('[REGISTER FAILED] User already exists');
        return NextResponse.json({ success: false, message: 'User already exists' }, { status: 409 });
      }

      const result = await client.query(
        'INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING *',
        [username, email, password]
      );

      await client.end();
      console.log('[REGISTER SUCCESS]', result.rows[0]);
      return NextResponse.json({ success: true, user: result.rows[0] }, { status: 201 });
    }

    await client.end();
    console.warn('[INVALID ACTION]', action);
    return NextResponse.json({ success: false, message: 'Invalid action' }, { status: 400 });

  } catch (err) {
    console.error('[AUTH_API_ERROR]', err);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
