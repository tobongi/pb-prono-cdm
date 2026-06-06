import { Router, Request, Response, NextFunction } from 'express'
import { validateFinishedMatches } from '../services/validation'

const router = Router()

// ADMIN_SECRET_KEY must be set in Railway env vars.
// Pass it as the x-admin-key header on every request to this router.
function requireAdminKey(req: Request, res: Response, next: NextFunction): void {
  const key = req.headers['x-admin-key']
  if (!key || key !== process.env.ADMIN_SECRET_KEY) {
    res.status(401).json({ error: 'unauthorized' })
    return
  }
  next()
}

// POST /api/admin/validate — trigger match validation
router.post('/validate', requireAdminKey, async (_req: Request, res: Response) => {
  try {
    const results = await validateFinishedMatches()
    const totalValidated = results.reduce((sum, r) => sum + r.validated, 0)
    const totalErrors = results.reduce((sum, r) => sum + r.errors, 0)
    res.json({ ok: true, total_validated: totalValidated, total_errors: totalErrors, results })
  } catch (err) {
    console.error('[admin] validation error:', err)
    res.status(500).json({ error: 'internal_error' })
  }
})

// GET /api/admin/health — key-guarded health check
router.get('/health', requireAdminKey, (_req: Request, res: Response) => {
  res.json({ ok: true, ts: new Date().toISOString() })
})

export default router
