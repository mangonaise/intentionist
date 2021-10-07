import { useLayoutEffect, useState } from 'react'

function useMediaQuery<T>(query: string, whenTrue: T, whenFalse: T) {
  const [isMatch, setIsMatch] = useState(false)

  useLayoutEffect(() => {
    const mediaQuery = window.matchMedia(query)
    const handleChange = () => setIsMatch(!!mediaQuery.matches)
    handleChange()
    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  return isMatch ? whenTrue : whenFalse
}

export default useMediaQuery