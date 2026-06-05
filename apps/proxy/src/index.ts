import express from 'express'
import cors from 'cors'
import rateLimit from 'express-rate-limit'
import helmet from 'helmet'
import morgan from 'morgan'
import matchesRouter from './routes/matches'
import groupsRouter from './routes/groups'

const app = express()
const PORT = process.env.PORT ?? 3001

app.use(helmet())
app.use(morgan('combined'))
app.use(cors({ origin: process.env.WEB_URL ?? '*' }))
app.use(express.json())

const limiter = rateLimit({ windowMs: 60_000, max: 100 })
app.use(limiter)

app.use('/api/matches', matchesRouter)
app.use('/api/groups', groupsRouter)

app.get('/health', (_req, res) => res.json({ ok: true }))

app.listen(PORT, () => console.log(`Proxy running on :${PORT}`))
