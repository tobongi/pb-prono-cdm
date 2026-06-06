import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getLocale } from 'next-intl/server'
import { BottomNav } from '@/components/bottom-nav'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  const locale = await getLocale()

  if (!session) {
    redirect(`/${locale}/login`)
  }

  return (
    <div className="min-h-screen pb-pattern-bg">
      {children}
      <BottomNav />
    </div>
  )
}
