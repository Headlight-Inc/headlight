import { useState, useEffect } from 'react'

const CACHE_PREFIX = 'headlight.ai.blurb.'

export function useAiBlurb(prompt: string, cacheKey: string) {
  const [text, setText] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!prompt || !cacheKey) return

    const fullKey = CACHE_PREFIX + cacheKey
    const cached = localStorage.getItem(fullKey)
    if (cached) {
      setText(cached)
      return
    }

    let isMounted = true
    const fetchBlurb = async () => {
      setIsLoading(true)
      try {
        const res = await fetch('/api/ai/generate-blurb', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt }),
        })
        if (!res.ok) throw new Error('AI generation failed')
        const data = await res.json()
        const result = data.text || ''
        
        if (isMounted) {
          setText(result)
          if (result) localStorage.setItem(fullKey, result)
        }
      } catch (err) {
        if (isMounted) setError(err as Error)
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }

    fetchBlurb()
    return () => { isMounted = false }
  }, [prompt, cacheKey])

  return { text, isLoading, error }
}
