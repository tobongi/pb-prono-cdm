'use client'
import { useEffect } from 'react'
import Link from 'next/link'

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[AppError]', error.message, error.digest)
  }, [error])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-8 text-center bg-bg-dark">
      <span className="text-4xl">⚠️</span>
      <p className="text-cream/70 font-body text-sm">
        Une erreur est survenue. Rechargez la page.
      </p>
      <p className="text-red-400/70 font-body text-xs max-w-xs break-words">
        {error.message}
        {error.digest && <span className="block mt-1 text-muted">#{error.digest}</span>}
      </p>
      <div className="flex gap-3">
        <button
          type="button"
          onClick={reset}
          className="px-4 py-2 bg-olive text-cream rounded-lg text-sm font-body hover:bg-olive/80 transition-colors"
        >
          Réessayer
        </button>
        <Link
          href="/fr/accueil"
          className="px-4 py-2 border border-olive/40 text-cream rounded-lg text-sm font-body hover:border-olive transition-colors"
        >
          Accueil
        </Link>
      </div>
    </div>
  )
}
