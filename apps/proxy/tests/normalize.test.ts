import { describe, it, expect } from 'vitest'
import { normalizeTeam } from '../src/lib/normalize'

describe('normalizeTeam', () => {
  it('lowercases and strips accents', () => {
    expect(normalizeTeam('États-Unis')).toBe('united states')
  })
  it('resolves known alias', () => {
    expect(normalizeTeam('USA')).toBe('united states')
  })
  it('handles Corée du Sud', () => {
    expect(normalizeTeam('Corée du Sud')).toBe('south korea')
  })
  it('passes through unknown names normalized', () => {
    expect(normalizeTeam('France')).toBe('france')
  })
})
