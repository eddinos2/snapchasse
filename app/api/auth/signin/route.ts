import { createServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { z } from 'zod'

const signInSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validation = signInSchema.safeParse(body)
    
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      )
    }

    // Créer le client Supabase avec les cookies de la requête
    const cookieStore = await cookies()
    let response = NextResponse.json({})

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
              response.cookies.set(name, value, options)
            })
          },
        },
      }
    )
    
    console.log('🔵 [API SIGNIN] Tentative de connexion pour:', validation.data.email)
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email: validation.data.email,
      password: validation.data.password,
    })

    if (error) {
      console.error('❌ [API SIGNIN] Erreur signInWithPassword:', error.message)
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      )
    }

    console.log('✅ [API SIGNIN] signInWithPassword réussi, userId:', data.user?.id)

    // Attendre un peu pour que les cookies soient bien écrits
    await new Promise(resolve => setTimeout(resolve, 100))

    // Vérifier que la session est bien créée
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    console.log('🔵 [API SIGNIN] getSession:', {
      hasSession: !!session,
      sessionError: sessionError?.message,
      userId: session?.user?.id
    })
    
    if (!session) {
      console.error('❌ [API SIGNIN] Session non créée après signInWithPassword')
      // Même sans session, on peut retourner l'utilisateur - les cookies sont peut-être déjà écrits
      return NextResponse.json(
        { 
          user: data.user,
          warning: 'Session non immédiatement disponible, mais cookies écrits'
        },
        {
          headers: response.headers,
        }
      )
    }

    console.log('✅ [API SIGNIN] Connexion réussie:', {
      userId: data.user?.id,
      hasSession: !!session
    })

    // Retourner la réponse avec les cookies mis à jour
    return NextResponse.json(
      { 
        user: data.user,
        session: session 
      },
      {
        headers: response.headers,
      }
    )
  } catch (error: any) {
    console.error('❌ [API SIGNIN] Erreur catch:', error)
    return NextResponse.json(
      { error: error.message || 'Une erreur est survenue' },
      { status: 500 }
    )
  }
}
