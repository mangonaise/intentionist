import debounce from 'lodash/debounce'
import { MutableRefObject, useLayoutEffect, useState } from 'react'

function useElementWidth(elementRef: MutableRefObject<HTMLElement>) {
  const [width, setWidth] = useState(elementRef.current?.offsetWidth ?? 0)

  useLayoutEffect(() => {
    const handleResize = () => setWidth(elementRef.current.offsetWidth)
    const debouncedHandleResize = debounce(handleResize, 500)
    handleResize()
    window.addEventListener('resize', debouncedHandleResize)
    return () => window.removeEventListener('resize', debouncedHandleResize)
  }, [elementRef])

  return width
}

export default useElementWidth