import { Router } from 'express'
import { getGroupStandings } from '../services/group-standings'

const router = Router()

router.get('/', async (_req, res) => {
  try {
    const { standings: groups, stale } = await getGroupStandings()
    res.json({ groups, stale })
  } catch {
    res.status(502).json({ error: 'upstream_unavailable' })
  }
})

export default router
