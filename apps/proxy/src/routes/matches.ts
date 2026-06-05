import { Router } from 'express'
import { getMatches } from '../services/openfootball'

const router = Router()

router.get('/', async (_req, res) => {
  try {
    const matches = await getMatches()
    res.json({ matches, stale: false })
  } catch (err) {
    res.status(502).json({ error: 'upstream_unavailable' })
  }
})

router.get('/:matchId', async (req, res) => {
  try {
    const matches = await getMatches()
    const match = matches.find(m => String(m.num) === req.params.matchId)
    if (!match) return res.status(404).json({ error: 'not_found' })
    res.json({ match, stale: false })
  } catch {
    res.status(502).json({ error: 'upstream_unavailable' })
  }
})

export default router
