// test.js (CommonJS style)
require('dotenv').config()
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.SUPABASE_PUBLIC_URL,
  process.env.SERVICE_ROLE_KEY
)

async function main() {
  const { data: user, error } = await supabase.auth.admin.createUser({
    email: 'newuser@example.com',
    password: 'P@ssword1',
    email_confirm: true
  })

  if (error || !user?.user) {
    console.error('Error creating user:', error)
    return
  }

  await supabase.from('users').insert({
    auth_user_id: user.user.id,
    display_name: 'New User',
    role: 'user',
    is_active: true
  })

  console.log('User created and inserted successfully!')
}

main()