/**
 * Script to create a real admin account in Supabase
 * Run with: npx tsx scripts/create-admin-account.ts
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials')
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

// Use service role key to create user
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

async function createAdminAccount() {
  const adminEmail = 'admin@snapchasse.fr'
  const adminPassword = 'AdminSnapChasse2024!'

  try {
    console.log('🔐 Creating admin account...')

    // Create user in auth.users
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true, // Auto-confirm email
    })

    if (authError) {
      if (authError.message.includes('already registered')) {
        console.log('ℹ️  Admin account already exists, updating profile...')
        
        // Get existing user
        const { data: existingUser } = await supabase.auth.admin.listUsers()
        const adminUser = existingUser?.users.find(u => u.email === adminEmail)
        
        if (adminUser) {
          // Update profile to admin role
          const { error: profileError } = await supabase
            .from('profiles')
            .upsert({
              id: adminUser.id,
              email: adminEmail,
              role: 'admin',
            }, {
              onConflict: 'id',
            })

          if (profileError) {
            console.error('❌ Error updating profile:', profileError)
            return
          }

          console.log('✅ Admin profile updated successfully!')
          console.log(`📧 Email: ${adminEmail}`)
          console.log(`🔑 Password: ${adminPassword}`)
          console.log(`👤 User ID: ${adminUser.id}`)
          return
        }
      } else {
        console.error('❌ Error creating admin user:', authError)
        return
      }
    }

    if (!authData?.user) {
      console.error('❌ Failed to create admin user')
      return
    }

    // Profile should be created automatically by trigger, but ensure it's admin
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: authData.user.id,
        email: adminEmail,
        role: 'admin',
      }, {
        onConflict: 'id',
      })

    if (profileError) {
      console.error('❌ Error creating/updating profile:', profileError)
      return
    }

    console.log('✅ Admin account created successfully!')
    console.log(`📧 Email: ${adminEmail}`)
    console.log(`🔑 Password: ${adminPassword}`)
    console.log(`👤 User ID: ${authData.user.id}`)
    console.log('')
    console.log('⚠️  IMPORTANT: Change this password after first login!')

  } catch (error: any) {
    console.error('❌ Unexpected error:', error)
  }
}

createAdminAccount()
