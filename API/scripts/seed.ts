import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_PUBLIC_DOCKER_URL!;
const SERVICE_ROLE_KEY = process.env.SERVICE_ROLE_KEY!;

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

async function main() {
  const { data, error } = await supabase.auth.admin.createUser({
    email: 'testuser@example.com',
    password: 'password123',
    email_confirm: true,
  });

  if (error) {
    if (error.message.includes('already registered')) {
      console.log('User already exists.');
    } else {
      console.error('Error creating user:', error);
    }
  } else {
    console.log('User created:', data);
  }
}

main();