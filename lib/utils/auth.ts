import { createClient } from '@/lib/supabase/server'
import type { User } from '@supabase/supabase-js'

export type UserRole = 'admin' | 'participant'

export interface UserProfile {
  id: string
  email: string | null
  role: UserRole
}

/**
 * Get the current authenticated user from server-side
 */
export async function getCurrentUser(): Promise<User | null> {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    return null
  }
  
  return user
}

/**
 * Get user profile with role
 */
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const supabase = await createClient()
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('id, email, role')
    .eq('id', userId)
    .single()
  
  if (error || !profile) {
    return null
  }
  
  return profile as UserProfile
}

/**
 * Get or create user profile
 */
export async function getOrCreateProfile(user: User): Promise<UserProfile> {
  const supabase = await createClient()
  
  // Try to get existing profile
  let { data: profile, error } = await supabase
    .from('profiles')
    .select('id, email, role')
    .eq('id', user.id)
    .single()
  
  // If profile doesn't exist, create it
  if (error && error.code === 'PGRST116') {
    const { data: newProfile, error: createError } = await supabase
      .from('profiles')
      .insert({
        id: user.id,
        email: user.email,
        role: 'participant'
      })
      .select('id, email, role')
      .single()
    
    if (createError || !newProfile) {
      // Fallback to default profile
      return {
        id: user.id,
        email: user.email || null,
        role: 'participant'
      }
    }
    
    profile = newProfile
  } else if (error || !profile) {
    // Other error - return default
    return {
      id: user.id,
      email: user.email || null,
      role: 'participant'
    }
  }
  
  return profile as UserProfile
}

/**
 * Check if user has admin role
 */
export async function isAdmin(userId: string): Promise<boolean> {
  const profile = await getUserProfile(userId)
  return profile?.role === 'admin'
}

/**
 * Require authentication - throws if not authenticated
 */
export async function requireAuth(): Promise<User> {
  const user = await getCurrentUser()
  if (!user) {
    throw new Error('Authentication required')
  }
  return user
}

/**
 * Require admin role - throws if not admin
 */
export async function requireAdmin(userId: string): Promise<void> {
  const admin = await isAdmin(userId)
  if (!admin) {
    throw new Error('Admin access required')
  }
}
