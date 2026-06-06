import { fetchGroups } from '@/lib/api'
import { GroupStandings } from '@/components/group-standings'

export const revalidate = 300

export default async function GroupesPage() {
  let groups: Awaited<ReturnType<typeof fetchGroups>> = []
  try {
    groups = await fetchGroups()
  } catch {
    groups = []
  }

  return (
    <main className="px-4 py-6 pb-24 max-w-lg mx-auto">
      <div className="text-center mb-8">
        <p className="text-beige text-xs uppercase tracking-widest mb-1">PHASE DE GROUPES</p>
        <h1 className="font-display text-4xl text-cream uppercase">Groupes</h1>
      </div>

      {groups.length === 0 ? (
        <div className="bg-bg-card rounded-xl p-8 text-center">
          <p className="text-muted text-sm">Données des groupes indisponibles</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {groups.map(g => (
            <GroupStandings
              key={g.name}
              name={g.name.replace('Group ', '')}
              standings={g.standings}
            />
          ))}
        </div>
      )}
    </main>
  )
}
