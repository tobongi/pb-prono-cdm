export type Phase = 'group' | 'knockout'

function getResult(score: [number, number]): 'home' | 'away' | 'draw' {
  if (score[0] > score[1]) return 'home'
  if (score[0] < score[1]) return 'away'
  return 'draw'
}

export function calculatePoints({
  pred,
  actual,
  phase,
}: {
  pred: [number, number]
  actual: [number, number]
  phase: Phase
}): number {
  const isExact = pred[0] === actual[0] && pred[1] === actual[1]
  const isCorrect = getResult(pred) === getResult(actual)

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
