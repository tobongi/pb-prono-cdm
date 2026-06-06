import 'flag-icons/css/flag-icons.min.css'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { LangSetter } from '@/components/lang-setter'
import { QueryProvider } from '@/providers/query-provider'
import { OfflineBanner } from '@/components/offline-banner'
import { ErrorBoundary } from '@/components/error-boundary'

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const messages = await getMessages()
  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <LangSetter locale={locale} />
      <QueryProvider>
        <OfflineBanner />
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
      </QueryProvider>
    </NextIntlClientProvider>
  )
}
