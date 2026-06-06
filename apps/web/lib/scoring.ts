type Phase = 'group' | 'knockout'

interface ScoringInput {
  pred: [number, number]
  actual: [number, number]
  phase: Phase
}

function getResult(score: [number, number]): 'home' | 'draw' | 'away' {
  if (score[0] > score[1]) return 'home'
  if (score[0] < score[1]) return 'away'
  return 'draw'
}

export function calculatePoints({ pred, actual, phase }: ScoringInput): number {
  const predResult = getResult(pred)
  const actualResult = getResult(actual)

  const isExact = pred[0] === actual[0] && pred[1] === actual[1]
  const isCorrect = predResult === actualResult

  if (phase === 'group') {
    if (isExact) return 7
    if (isCorrect) return 3
    return 0
  }

  // knockout
  if (isExact) return 12
  if (isCorrect) return 5
  return 0
}

export function isKnockoutMatch(round?: string): boolean {
  if (!round) return false
  const koRounds = ['Round of 32', 'Round of 16', 'Quarter-final', 'Semi-final', 'Final', '3rd Place']
  return koRounds.some(r => round.includes(r))
}
