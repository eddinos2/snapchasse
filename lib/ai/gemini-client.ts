/**
 * Gemini AI Client for generating questions, descriptions, and content moderation
 */

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent'

export interface GeneratedQuestion {
  question: string
  answer: string
  hint1?: string
  hint2?: string
  hint3?: string
}

export interface GenerateQuestionOptions {
  coords: [number, number] // [longitude, latitude]
  title?: string
  description?: string
  context?: string
}

export async function generateQuestion(
  options: GenerateQuestionOptions
): Promise<GeneratedQuestion> {
  if (!GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not configured')
  }

  const { coords, title = '', description = '', context = '' } = options
  const [lng, lat] = coords

  const prompt = `Tu es un expert en création d'énigmes pour des jeux de piste géolocalisés.

Génère une question d'énigme intéressante et engageante pour un lieu situé aux coordonnées :
- Latitude: ${lat}
- Longitude: ${lng}
${title ? `- Titre du lieu: ${title}` : ''}
${description ? `- Description: ${description}` : ''}
${context ? `- Contexte supplémentaire: ${context}` : ''}

La question doit être:
- En français
- Adaptée au lieu (monument, quartier, histoire, culture)
- Ni trop facile ni trop difficile
- Intéressante et engageante

Réponds UNIQUEMENT avec un objet JSON valide de ce format (pas de texte avant/après):
{
  "question": "La question d'énigme",
  "answer": "La réponse attendue (mot ou phrase courte, en minuscules)",
  "hint1": "Premier indice (facile)",
  "hint2": "Deuxième indice (moyen)",
  "hint3": "Troisième indice (précis)"
}`

  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Gemini API error: ${response.status} - ${errorText}`)
    }

    const data = await response.json()

    if (!data.candidates || !data.candidates[0]?.content?.parts?.[0]?.text) {
      throw new Error('Invalid response from Gemini API')
    }

    const text = data.candidates[0].content.parts[0].text.trim()

    // Parse JSON from response (might have markdown code blocks)
    let jsonText = text
    if (text.startsWith('```')) {
      const match = text.match(/```(?:json)?\n([\s\S]*?)\n```/)
      if (match) {
        jsonText = match[1]
      }
    }

    const parsed = JSON.parse(jsonText) as GeneratedQuestion

    // Validate response
    if (!parsed.question || !parsed.answer) {
      throw new Error('Invalid question format from Gemini')
    }

    return parsed
  } catch (error) {
    console.error('Error generating question with Gemini:', error)
    throw error
  }
}

export interface GenerateDescriptionOptions {
  coords: [number, number]
  title?: string
  basicDescription?: string
}

export async function generateDescription(
  options: GenerateDescriptionOptions
): Promise<string> {
  if (!GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not configured')
  }

  const { coords, title = '', basicDescription = '' } = options
  const [lng, lat] = coords

  const prompt = `Tu es un expert en rédaction de descriptions touristiques et culturelles.

Enrichis cette description basique avec du contexte historique, culturel, ou des détails intéressants sur ce lieu :

Coordonnées: ${lat}, ${lng}
${title ? `Titre: ${title}` : ''}
Description basique: ${basicDescription || '(aucune description fournie)'}

Crée une description enrichie et engageante (2-3 phrases maximum) en français qui donne envie de visiter ce lieu.
Réponds UNIQUEMENT avec la description enrichie, sans guillemets ni formatage.`

  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Gemini API error: ${response.status} - ${errorText}`)
    }

    const data = await response.json()

    if (!data.candidates || !data.candidates[0]?.content?.parts?.[0]?.text) {
      throw new Error('Invalid response from Gemini API')
    }

    return data.candidates[0].content.parts[0].text.trim()
  } catch (error) {
    console.error('Error generating description with Gemini:', error)
    throw error
  }
}

export interface ModerateContentResult {
  isSafe: boolean
  reason?: string
}

export async function moderateContent(text: string): Promise<ModerateContentResult> {
  if (!GEMINI_API_KEY) {
    // Si pas de clé, on considère comme safe (fallback)
    return { isSafe: true }
  }

  const prompt = `Analyse ce contenu pour un jeu de piste et détermine s'il est approprié pour tous publics.

Contenu à analyser: "${text}"

Le contenu est-il approprié (pas de contenu offensant, violent, inapproprié, politique sensible) ?
Réponds UNIQUEMENT avec un objet JSON :
{
  "isSafe": true/false,
  "reason": "Raison si isSafe est false (optionnel)"
}`

  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
      }),
    })

    if (!response.ok) {
      // En cas d'erreur, on considère comme safe pour ne pas bloquer
      console.warn('Gemini moderation API error, defaulting to safe')
      return { isSafe: true }
    }

    const data = await response.json()

    if (!data.candidates || !data.candidates[0]?.content?.parts?.[0]?.text) {
      return { isSafe: true }
    }

    const text = data.candidates[0].content.parts[0].text.trim()
    let jsonText = text
    if (text.startsWith('```')) {
      const match = text.match(/```(?:json)?\n([\s\S]*?)\n```/)
      if (match) {
        jsonText = match[1]
      }
    }

    const parsed = JSON.parse(jsonText) as ModerateContentResult

    return parsed
  } catch (error) {
    console.error('Error moderating content with Gemini:', error)
    // En cas d'erreur, on considère comme safe
    return { isSafe: true }
  }
}
