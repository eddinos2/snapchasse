/**
 * Script to create a real participant account in Supabase
 * Run with: npx tsx scripts/create-participant-account.ts
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

async function createParticipantAccount() {
  const participantEmail = 'player@snapchasse.fr'
  const participantPassword = 'PlayerSnapChasse2024!'

  try {
    console.log('🔐 Creating participant account...')

    // Create user in auth.users
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: participantEmail,
      password: participantPassword,
      email_confirm: true, // Auto-confirm email
    })

    if (authError) {
      if (authError.message.includes('already registered')) {
        console.log('ℹ️  Participant account already exists')
        return
      } else {
        console.error('❌ Error creating participant user:', authError)
        return
      }
    }

    if (!authData?.user) {
      console.error('❌ Failed to create participant user')
      return
    }

    // Profile should be created automatically by trigger
    console.log('✅ Participant account created successfully!')
    console.log(`📧 Email: ${participantEmail}`)
    console.log(`🔑 Password: ${participantPassword}`)
    console.log(`👤 User ID: ${authData.user.id}`)

  } catch (error: any) {
    console.error('❌ Unexpected error:', error)
  }
}

createParticipantAccount()
