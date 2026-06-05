import { Router } from 'express'
import { getGroups } from '../services/openfootball'

const router = Router()

router.get('/', async (_req, res) => {
  try {
    const groups = await getGroups()
    res.json({ groups, stale: false })
  } catch {
    res.status(502).json({ error: 'upstream_unavailable' })
  }
})

export default router
