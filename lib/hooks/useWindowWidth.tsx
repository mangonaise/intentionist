import debounce from 'lodash/debounce'
import { useLayoutEffect, useState } from 'react'

function useWindowWidth() {
  const [width, setWidth] = useState(window.innerWidth)

  useLayoutEffect(() => {
    const handleResize = () => setWidth(window.innerWidth)
    const debouncedHandleResize = debounce(handleResize, 500)
    window.addEventListener('resize', debouncedHandleResize)
    return () => window.removeEventListener('resize', debouncedHandleResize)
  }, [])

  return width
}

export default useWindowWidth