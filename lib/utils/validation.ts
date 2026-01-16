import { z } from 'zod'

// Auth schemas
export const signInSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
})

export const signUpSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"],
})

// Hunt schemas
export const huntSchema = z.object({
  title: z.string().min(1, 'Le titre est requis'),
  description: z.string().optional(),
})

export const stepSchema = z.object({
  title: z.string().min(1, 'Titre requis'),
  description: z.string().optional(),
  question: z.string().min(1, 'Question requise'),
  answer: z.string().min(1, 'Réponse requise'),
  latitude: z.number().min(-90).max(90).nullable().optional(),
  longitude: z.number().min(-180).max(180).nullable().optional(),
  radius_meters: z.number().min(10).max(1000).default(50),
})

export const createHuntSchema = z.object({
  title: z.string().min(1, 'Le titre est requis'),
  description: z.string().optional(),
  steps: z.array(stepSchema).min(1, 'Au moins une étape est requise'),
})

// Helper function to validate and get error message
export function validateSchema<T>(schema: z.ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; error: string } {
  const result = schema.safeParse(data)
  if (result.success) {
    return { success: true, data: result.data }
  }
  return {
    success: false,
    error: result.error.errors[0]?.message || 'Validation error'
  }
}
