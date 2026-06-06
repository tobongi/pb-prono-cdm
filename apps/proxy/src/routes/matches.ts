import { Router } from 'express'
import { getMatches } from '../services/openfootball'
import { getLiveMatches } from '../services/worldcup-live'
import { mergeMatchData } from '../services/merger'

const router = Router()

router.get('/', async (_req, res) => {
  try {
    const [ofMatches, { matches: liveMatches, stale }] = await Promise.all([
      getMatches(),
      getLiveMatches(),
    ])
    const matches = mergeMatchData(ofMatches, liveMatches)
    res.json({ matches, stale })
  } catch {
    res.status(502).json({ error: 'upstream_unavailable' })
  }
})

router.get('/:matchId', async (req, res) => {
  try {
    const [ofMatches, { matches: liveMatches, stale }] = await Promise.all([
      getMatches(),
      getLiveMatches(),
    ])
    const merged = mergeMatchData(ofMatches, liveMatches)
    const match = merged.find(m => String(m.num) === req.params.matchId)
    if (!match) return res.status(404).json({ error: 'not_found' })
    res.json({ match, stale })
  } catch {
    res.status(502).json({ error: 'upstream_unavailable' })
  }
})

export default router
