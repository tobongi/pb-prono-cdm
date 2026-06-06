'use client'
import { useEffect, useState } from 'react'

export function OfflineBanner() {
  const [isOffline, setIsOffline] = useState(false)

  useEffect(() => {
    // Set initial state (only on client — navigator is undefined on server)
    setIsOffline(!navigator.onLine)

    function handleOffline() { setIsOffline(true) }
    function handleOnline() { setIsOffline(false) }

    window.addEventListener('offline', handleOffline)
    window.addEventListener('online', handleOnline)

    return () => {
      window.removeEventListener('offline', handleOffline)
      window.removeEventListener('online', handleOnline)
    }
  }, [])

  if (!isOffline) return null

  return (
    <div
      role="alert"
      aria-live="polite"
      className="fixed top-0 left-0 right-0 z-[100] bg-live text-white text-center py-2 px-4 text-sm font-body"
    >
      Vous êtes hors ligne. Les données peuvent être obsolètes.
    </div>
  )
}
