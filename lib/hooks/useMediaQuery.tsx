import { useEffect, useState } from 'react'

function useMediaQuery<T>(query: string, whenTrue: T, whenFalse: T) {
  const mediaQuery = typeof window !== undefined ? window.matchMedia(query) : null
  const [isMatch, setIsMatch] = useState(!!mediaQuery?.matches)

  useEffect(() => {
    const handleChange = () => setIsMatch(!!mediaQuery!.matches)
    mediaQuery!.addEventListener('change', handleChange)
    return () => mediaQuery!.removeEventListener('change', handleChange)
  }, [])

  return isMatch ? whenTrue : whenFalse
}

export default useMediaQuery