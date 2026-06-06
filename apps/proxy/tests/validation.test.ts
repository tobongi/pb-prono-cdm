import { describe, it, expect } from 'vitest'
import { calculatePoints, isKnockoutMatch } from '../src/lib/scoring'

describe('proxy scoring — calculatePoints', () => {
  it('group exact = 7', () => {
    expect(calculatePoints({ pred: [2, 1], actual: [2, 1], phase: 'group' })).toBe(7)
  })

  it('group correct result (not exact) = 3', () => {
    expect(calculatePoints({ pred: [1, 0], actual: [3, 0], phase: 'group' })).toBe(3)
  })

  it('group wrong result = 0', () => {
    expect(calculatePoints({ pred: [1, 0], actual: [0, 1], phase: 'group' })).toBe(0)
  })

  it('group draw exact = 7', () => {
    expect(calculatePoints({ pred: [1, 1], actual: [1, 1], phase: 'group' })).toBe(7)
  })

  it('group draw correct (not exact) = 3', () => {
    expect(calculatePoints({ pred: [0, 0], actual: [2, 2], phase: 'group' })).toBe(3)
  })

  it('knockout exact = 12', () => {
    expect(calculatePoints({ pred: [2, 1], actual: [2, 1], phase: 'knockout' })).toBe(12)
  })

  it('knockout correct result (not exact) = 5', () => {
    expect(calculatePoints({ pred: [1, 0], actual: [3, 0], phase: 'knockout' })).toBe(5)
  })

  it('knockout wrong result = 0', () => {
    expect(calculatePoints({ pred: [1, 0], actual: [0, 1], phase: 'knockout' })).toBe(0)
  })
})

describe('proxy scoring — isKnockoutMatch', () => {
  it('Round of 16 is knockout', () => {
    expect(isKnockoutMatch('Round of 16')).toBe(true)
  })

  it('Round of 32 is knockout', () => {
    expect(isKnockoutMatch('Round of 32')).toBe(true)
  })

  it('Quarter-final is knockout', () => {
    expect(isKnockoutMatch('Quarter-final')).toBe(true)
  })

  it('Semi-final is knockout', () => {
    expect(isKnockoutMatch('Semi-final')).toBe(true)
  })

  it('Final is knockout', () => {
    expect(isKnockoutMatch('Final')).toBe(true)
  })

  it('3rd Place is knockout', () => {
    expect(isKnockoutMatch('3rd Place')).toBe(true)
  })

  it('Group A is not knockout', () => {
    expect(isKnockoutMatch('Group A')).toBe(false)
  })

  it('undefined is not knockout', () => {
    expect(isKnockoutMatch(undefined)).toBe(false)
  })

  it('empty string is not knockout', () => {
    expect(isKnockoutMatch('')).toBe(false)
  })
})
