import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getLocale } from 'next-intl/server'
import { BottomNav } from '@/components/bottom-nav'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const locale = await getLocale()

  if (!user) {
    redirect(`/${locale}/login`)
  }

  return (
    <div
      className="min-h-screen pb-pattern-bg"
      style={{ backgroundImage: "url('/pb-pattern.png')", backgroundRepeat: 'repeat', backgroundSize: '600px 600px' }}
    >
      {children}
      <BottomNav />
    </div>
  )
}
