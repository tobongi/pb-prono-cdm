'use client'
import { Component, type ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[ErrorBoundary] caught:', error, info)
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback
      const msg = this.state.error?.message ?? 'Unknown error'
      return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-8 text-center bg-bg-dark">
          <span className="text-4xl">⚠️</span>
          <p className="text-cream/70 font-body text-sm">
            Une erreur est survenue. Rechargez la page.
          </p>
          {/* Show error details so we can diagnose */}
          <p className="text-red-400/70 font-body text-xs max-w-xs break-words">
            {msg}
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-olive text-cream rounded-lg text-sm font-body hover:bg-olive/80 transition-colors"
          >
            Réessayer
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
