import { NextRequest, NextResponse } from 'next/server';
import { Client } from 'pg';

export async function POST(req: NextRequest) {
  try {
    const { action, email, password } = await req.json();

    if (!action || !email || !password) {
      return NextResponse.json({ success: false, message: 'Missing fields' }, { status: 400 });
    }

    const client = new Client({
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });

    await client.connect();

    if (action === "login") {
      const query = 'SELECT * FROM users WHERE email = $1 AND password = $2';
      const result = await client.query(query, [email, password]);

      await client.end();

      if (result.rows.length === 1) {
        const user = result.rows[0];
        return NextResponse.json({ success: true, user }, { status: 200 });
      } else {
        return NextResponse.json({ success: false, message: 'Invalid credentials' }, { status: 401 });
      }
    } 
    
    else if (action === "register") {
      const checkUser = await client.query('SELECT * FROM users WHERE email = $1', [email]);
      if (checkUser.rows.length > 0) {
        await client.end();
        return NextResponse.json({ success: false, message: 'User already exists' }, { status: 409 });
      }

      const insertQuery = 'INSERT INTO users (email, password) VALUES ($1, $2) RETURNING *';
      const insertResult = await client.query(insertQuery, [email, password]);
      const newUser = insertResult.rows[0];

      await client.end();

      return NextResponse.json({ success: true, user: newUser }, { status: 201 });
    } 
    
    else {
      await client.end();
      return NextResponse.json({ success: false, message: 'Invalid action' }, { status: 400 });
    }

  } catch (err) {
    console.error('[AUTH_API_ERROR]', err);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
