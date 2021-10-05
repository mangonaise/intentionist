import { useEffect, useState } from 'react'

function useMediaQuery<T>(query: string, whenTrue: T, whenFalse: T) {
  if (typeof window === 'undefined' || typeof window.matchMedia === 'undefined') {
    return whenFalse
  }

  const mediaQuery = window.matchMedia(query)
  const [isMatch, setIsMatch] = useState(!!mediaQuery.matches)

  useEffect(() => {
    const handleChange = () => setIsMatch(!!mediaQuery.matches)
    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  return isMatch ? whenTrue : whenFalse
}

export default useMediaQuery