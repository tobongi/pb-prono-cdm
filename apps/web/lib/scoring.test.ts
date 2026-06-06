import { describe, it, expect } from 'vitest'
import { calculatePoints } from './scoring'

describe('calculatePoints', () => {
  it('exact score in group stage = 7', () => {
    expect(calculatePoints({ pred: [2, 1], actual: [2, 1], phase: 'group' })).toBe(7)
  })

  it('correct result in group stage = 3', () => {
    expect(calculatePoints({ pred: [2, 0], actual: [3, 1], phase: 'group' })).toBe(3)
  })

  it('wrong result = 0', () => {
    expect(calculatePoints({ pred: [2, 0], actual: [0, 1], phase: 'group' })).toBe(0)
  })

  it('draw predicted and draw actual = 3', () => {
    expect(calculatePoints({ pred: [1, 1], actual: [0, 0], phase: 'group' })).toBe(3)
  })

  it('exact score draw in group = 7', () => {
    expect(calculatePoints({ pred: [1, 1], actual: [1, 1], phase: 'group' })).toBe(7)
  })

  it('correct result KO = 5', () => {
    expect(calculatePoints({ pred: [2, 0], actual: [1, 0], phase: 'knockout' })).toBe(5)
  })

  it('exact score KO = 12', () => {
    expect(calculatePoints({ pred: [2, 1], actual: [2, 1], phase: 'knockout' })).toBe(12)
  })
})
