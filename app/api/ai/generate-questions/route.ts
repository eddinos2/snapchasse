import { NextRequest, NextResponse } from 'next/server'
import { generateQuestion, generateDescription, moderateContent } from '@/lib/ai/gemini-client'

export const runtime = 'edge'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, ...options } = body

    if (type === 'question') {
      const result = await generateQuestion(options)
      return NextResponse.json({ success: true, data: result })
    } else if (type === 'description') {
      const result = await generateDescription(options)
      return NextResponse.json({ success: true, data: result })
    } else if (type === 'moderate') {
      const { text } = options
      if (!text) {
        return NextResponse.json({ success: false, error: 'Text is required' }, { status: 400 })
      }
      const result = await moderateContent(text)
      return NextResponse.json({ success: true, data: result })
    } else {
      return NextResponse.json({ success: false, error: 'Invalid type' }, { status: 400 })
    }
  } catch (error: any) {
    console.error('Error in AI API route:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to process AI request',
      },
      { status: 500 }
    )
  }
}
