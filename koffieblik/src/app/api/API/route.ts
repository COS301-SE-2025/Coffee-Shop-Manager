import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_PUBLIC_DOCKER_URL!;
const supabaseKey = process.env.SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, ...params } = body;

    switch (action) {
      case 'login':
        return await login(params);
      // case 'register':
      //   return await register(params);
      // case 'username':
      //   return await username(params);
      // case 'change_Username':
      //   return await changeUsername(body);
      default:
        return NextResponse.json({ success: false, message: 'Unknown action' }, { status: 400 });
    }
  } catch (err) {
    console.error('API error', err);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}

async function login({ email, password }: { email?: string; password?: string }) {
  if (!email || !password) {
    return NextResponse.json({ success: false, message: 'Email and password required' }, { status: 400 });
  }

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error || !data.user) {
    return NextResponse.json({ success: false, message: error?.message || 'Login failed' }, { status: 401 });
  }

  const { data: userProfile, error: profileError } = await supabase
    .from('users')
    .select('*')
    .eq('auth_user_id', data.user.id)
    .single();

  if (profileError) {
    console.warn('No user profile found', profileError);
  }

  return NextResponse.json({
    success: true,
    user: data.user,
    profile: userProfile || null,
  });
}

// Ignore below, it is being used to update/implement the above
/////////////////////////////////////////////////////////////

// import { NextRequest, NextResponse } from 'next/server';
// import { Client } from 'pg';

// export async function POST(req: NextRequest) {
//   let client;
//   try {
//     if (!process.env.DB_PASSWORD) {
//       console.error('[DB CONFIG ERROR] Password not found in environment variables');
//       return NextResponse.json({ 
//         success: false, 
//         message: 'Database configuration error' 
//       }, { status: 500 });
//     }

//     const config = {
//       host: process.env.DB_HOST || 'localhost',
//       port: Number(process.env.DB_PORT) || 5432,
//       user: process.env.DB_USER || 'postgres',
//       password: String(process.env.DB_PASSWORD),
//       database: process.env.DB_NAME || 'koffieblik',
//       ssl: false
//     };

//     // Debug config (safely)
//     console.log('[DB CONFIG]', {
//       host: config.host,
//       port: config.port,
//       user: config.user,
//       database: config.database,
//       hasPassword: Boolean(config.password),
//       passwordLength: config.password?.length
//     });

//     client = new Client(config);
//     await client.connect();
//     console.log('[DB CONNECTED]');

//     const body = await req.json(); // ✅ Read request body
//     console.log('[RECEIVED BODY]', body);

//     const { action, username, email, password,lastName,phoneNo,dateOfBirth} = body;

//     if (!action) {
//       console.warn('[VALIDATION FAILED] Missing action');
//       return NextResponse.json({ success: false, message: 'Missing action' }, { status: 400 });
//     }

//     if (action === 'login') {
//       if (!email || !password) {
//         console.warn('[VALIDATION FAILED] Missing login fields');
//         return NextResponse.json({ success: false, message: 'Email and password required for login' }, { status: 400 });
//       }
//     }

//     if (action === 'register') {
//       if (!username || !email || !password) {
//         console.warn('[VALIDATION FAILED] Missing registration fields');
//         return NextResponse.json({ success: false, message: 'Username, email, and password required for registration' }, { status: 400 });
//       }
//     }

//     if (action === 'username') {
//       if (!email) {
//         console.warn('[VALIDATION FAILED] Missing registration fields');
//         return NextResponse.json({ success: false, message: 'Email required for username retreival' }, { status: 400 });
//       }
//     }

//     if (action === 'change_username') {
//       if (!username||!email) {
//         console.warn('[VALIDATION FAILED] Missing registration fields');
//         return NextResponse.json({ success: false, message: 'Email required for username retreival' }, { status: 400 });
//       }
//     }


//     if (action === 'login') {
//       console.log('[LOGIN ATTEMPT]', email);
//       const query = 'SELECT * FROM users WHERE email = $1 AND password = $2';
//       const result = await client.query(query, [email, password]);
//       await client.end();

//       if (result.rows.length === 1) {
//         console.log('[LOGIN SUCCESS]', result.rows[0]);
//         return NextResponse.json({ success: true, user: result.rows[0] }, { status: 200 });
//       } else {
//         console.warn('[LOGIN FAILED] Invalid credentials');
//         return NextResponse.json({ success: false, message: 'Invalid credentials' }, { status: 401 });
//       }
//     }

//     if (action === 'username') {
//       console.log('[USERNAME RETRIEVAL] Request received for email:', email);

//       const query = 'SELECT username FROM users WHERE email = $1';
//       const result = await client.query(query, [email]);

//       await client.end();

//       if (result.rows.length === 1) {
//         console.log('[USERNAME RETRIEVED]', result.rows[0].username);
//         return NextResponse.json({ success: true, username: result.rows[0].username }, { status: 200 });
//       } else {
//         console.warn('[USERNAME FAILED] No user with that email');
//         return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
//       }
//     }

//     if (action === 'change_Username') {
//       if (!email || !username) {
//         await client.end();
//         console.warn('[USERNAME CHANGE FAILED] Missing email or new username');
//         return NextResponse.json({ success: false, message: 'Email and new username are required' }, { status: 400 });
//       }

//       console.log('[USERNAME CHANGE ATTEMPT] Email:', email, 'New Username:', username);

//       const result = await client.query(
//         'UPDATE users SET username = $1 WHERE email = $2 RETURNING *',
//         [username, email]
//       );

//       await client.end();

//       if (result.rows.length === 1) {
//         console.log('[USERNAME CHANGE SUCCESS]', result.rows[0]);
//         return NextResponse.json({ success: true, user: result.rows[0] }, { status: 200 });
//       } else {
//         console.warn('[USERNAME CHANGE FAILED] No user with that email');
//         return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
//       }
//     }




//     if (action === 'register') {
//       console.log('[REGISTER ATTEMPT]', email);

//       const existing = await client.query('SELECT * FROM users WHERE email = $1', [email]);
//       if (existing.rows.length > 0) {
//         await client.end();
//         return NextResponse.json({ success: false, message: 'User already exists' }, { status: 409 });
//       }

//       const result = await client.query(
//         `INSERT INTO users (username, email, password, last_name, phone_number, date_of_birth)
//          VALUES ($1, $2, $3, $4, $5, $6)
//          RETURNING *`,
//         [username, email, password, lastName, phoneNo, dateOfBirth]
//       );

//       await client.end();
//       console.log('[REGISTER SUCCESS]', result.rows[0]);
//       return NextResponse.json({ success: true, user: result.rows[0] }, { status: 201 });
//     }

// // ORDER

//       if (action === 'submit_order') {
//     const { userId, items } = body;

//     if (!userId || !Array.isArray(items) || items.length === 0) {
//       await client.end();
//       return NextResponse.json({ success: false, message: 'Invalid order data' }, { status: 400 });
//     }

//     const insertQuery = `
//       INSERT INTO orders (user_id, product_id, price, quantity, order_date)
//       VALUES ($1, $2, $3, $4, NOW())
//       RETURNING *`;

//     const insertedOrders = [];

//     for (const item of items) {
//       const { name: product_id, price, quantity } = item;
//       const result = await client.query(insertQuery, [userId, product_id, price, quantity]);
//       insertedOrders.push(result.rows[0]);
//     }

//     await client.end();
//     console.log('[ORDER SUBMITTED]', insertedOrders);
//     return NextResponse.json({ success: true, orders: insertedOrders }, { status: 201 });
//   }


//   // Get all orders
// if (action === 'get_orders') {
//   const result = await client.query('SELECT * FROM orders ORDER BY order_date DESC');
//   await client.end();
//   return NextResponse.json({ success: true, orders: result.rows }, { status: 200 });
// }

// // Mark as done
// if (action === 'mark_done') {
//   const { orderId } = body;

//   if (!orderId) {
//     await client.end();
//     return NextResponse.json({ success: false, message: 'Missing orderId' }, { status: 400 });
//   }

//   const result = await client.query(
//     'UPDATE orders SET status = $1 WHERE id = $2 RETURNING *',
//     ['done', orderId]
//   );

//   await client.end();

//   if (result.rows.length === 1) {
//     return NextResponse.json({ success: true, order: result.rows[0] }, { status: 200 });
//   } else {
//     return NextResponse.json({ success: false, message: 'Order not found' }, { status: 404 });
//   }
// }



//     await client.end();
//     console.warn('[INVALID ACTION]', action);
//     return NextResponse.json({ success: false, message: 'Invalid action' }, { status: 400 });

//   } catch (err) {
//     console.error('[AUTH_API_ERROR]', err);
//     return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
//   }
// }