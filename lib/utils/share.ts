/**
 * Share utilities for generating shareable links
 */

export function generateShareUrl(huntId: string, shareToken?: string): string {
  if (typeof window === 'undefined') {
    return ''
  }
  
  const baseUrl = window.location.origin
  if (shareToken) {
    return `${baseUrl}/hunt/${huntId}?share=${shareToken}`
  }
  return `${baseUrl}/hunt/${huntId}`
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text)
      return true
    }
    // Fallback for older browsers
    const textArea = document.createElement('textarea')
    textArea.value = text
    textArea.style.position = 'fixed'
    textArea.style.left = '-999999px'
    document.body.appendChild(textArea)
    textArea.focus()
    textArea.select()
    const success = document.execCommand('copy')
    document.body.removeChild(textArea)
    return success
  } catch (err) {
    console.error('Failed to copy:', err)
    return false
  }
}

export function shareViaWebAPI(url: string, title: string, text?: string): Promise<boolean> {
  if (navigator.share) {
    return navigator.share({
      title,
      text: text || title,
      url,
    })
      .then(() => true)
      .catch(() => false)
  }
  return Promise.resolve(false)
}
