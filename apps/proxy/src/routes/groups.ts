import { Router } from 'express'
import { getGroupStandings } from '../services/group-standings'

const router = Router()

router.get('/', async (_req, res) => {
  try {
    const groups = await getGroupStandings()
    res.json({ groups, stale: false })
  } catch {
    res.status(502).json({ error: 'upstream_unavailable' })
  }
})

export default router
