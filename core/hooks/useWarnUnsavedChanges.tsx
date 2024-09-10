import { useEffect } from 'react'
import Router from 'next/router'

type WarnConditions = {
  routeChange: boolean,
  unload: boolean
}

export default function useWarnUnsavedChanges(warnConditions: WarnConditions, confirmationMessage: string) {
  useEffect(() => {
    if (warnConditions.routeChange) {
      Router.events.on('routeChangeStart', beforeRouteChangeHandler)
    } else {
      Router.events.off('routeChangeStart', beforeRouteChangeHandler)
    }

    if (warnConditions.unload) {
      window.addEventListener('beforeunload', beforeUnloadHandler)
    } else {
      window.removeEventListener('beforeunload', beforeUnloadHandler)
    }

    return () => removeEventListeners()
  }, [warnConditions])

  function beforeRouteChangeHandler(url: string) {
    if (Router.pathname !== url && !confirm(confirmationMessage)) {
      Router.events.emit('routeChangeError')
      throw new Error('Route change was cancelled (you can safely ignore this error).')
    }
  }

  function beforeUnloadHandler(e: BeforeUnloadEvent) {
    (e || window.event).returnValue = confirmationMessage
    return confirmationMessage
  }

  function removeEventListeners() {
    window.removeEventListener('beforeunload', beforeUnloadHandler)
    Router.events.off('routeChangeStart', beforeRouteChangeHandler)
  }
}