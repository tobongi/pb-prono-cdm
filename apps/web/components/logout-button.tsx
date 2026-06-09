'use client'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export function LogoutButton() {
  const router = useRouter()

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/fr/login')
    router.refresh()
  }

  return (
    <button
      onClick={handleLogout}
      className="w-full bg-bg-card border border-red-500/30 text-red-400 font-display text-sm uppercase py-3 rounded-xl hover:bg-red-500/10 transition-colors"
    >
      Se déconnecter
    </button>
  )
}
