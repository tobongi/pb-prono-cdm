import { createClient } from '@supabase/supabase-js'
import { getMatches } from './openfootball'
import { getLiveMatches } from './worldcup-live'
import { mergeMatchData } from './merger'
import { calculatePoints, isKnockoutMatch } from '../lib/scoring'

// SUPABASE_URL and SUPABASE_SERVICE_KEY must be set in Railway env vars.
// Use the SERVICE ROLE key (not the anon key) so this bypasses RLS.
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!,
)

export interface ValidationResult {
  matchNum: number
  validated: number
  skipped: number
  errors: number
}

export async function validateFinishedMatches(): Promise<ValidationResult[]> {
  // Fetch and merge match data (same pattern as matches route)
  const [ofMatches, { matches: liveMatches }] = await Promise.all([
    getMatches(),
    getLiveMatches(),
  ])
  const matches = mergeMatchData(ofMatches, liveMatches)

  // Only process finished matches that have a final score
  const finished = matches.filter(
    m => m.status === 'finished' && m.score?.ft != null,
  )

  const results: ValidationResult[] = []

  for (const match of finished) {
    const actual = match.score!.ft as [number, number]
    const phase = isKnockoutMatch(match.round) ? 'knockout' : 'group'

    // Fetch predictions for this match that haven't been validated yet
    // NOTE: match_id is text in schema, home_score_pred/away_score_pred are the correct column names
    const { data: preds, error: fetchErr } = await supabase
      .from('predictions')
      .select('id, home_score_pred, away_score_pred')
      .eq('match_id', String(match.num))
      .is('points_earned', null)

    if (fetchErr) {
      console.error(`[validation] fetch error match ${match.num}:`, fetchErr)
      results.push({ matchNum: match.num, validated: 0, skipped: 0, errors: 1 })
      continue
    }

    if (!preds || preds.length === 0) {
      // No unvalidated predictions — skip silently
      results.push({ matchNum: match.num, validated: 0, skipped: 0, errors: 0 })
      continue
    }

    let validated = 0
    let errors = 0

    for (const pred of preds) {
      const predScore: [number, number] = [pred.home_score_pred, pred.away_score_pred]
      const points = calculatePoints({ pred: predScore, actual, phase })

      const { error: updateErr } = await supabase
        .from('predictions')
        .update({
          points_earned: points,
        })
        .eq('id', pred.id)

      if (updateErr) {
        console.error(`[validation] update error pred ${pred.id}:`, updateErr)
        errors++
      } else {
        validated++
      }
    }

    results.push({ matchNum: match.num, validated, skipped: 0, errors })
    console.log(
      `[validation] match ${match.num}: ${validated} validated, ${errors} errors`,
    )
  }

  return results
}
