import { describe, it, expect } from 'vitest'
import { getRsBundle } from '../registry'
import { ALL_MODES } from '@headlight/modes'
import type { Mode } from '@headlight/types'

describe('right-sidebar bundle/definition parity', () => {
  it('every Mode is registered exactly once', () => {
    for (const def of ALL_MODES) {
      const bundle = getRsBundle(def.id)
      expect(bundle.mode).toBe(def.id)
    }
  })

  it('bundle.tabs ids and order match definition rsTabs for every mode', () => {
    for (const def of ALL_MODES) {
      const bundle = getRsBundle(def.id)
      expect(bundle.tabs.length).toBe(def.rsTabs.length)
      bundle.tabs.forEach((tab, i) => {
        expect(tab.id).toBe(def.rsTabs[i].id)
        expect(tab.label).toBe(def.rsTabs[i].label)
      })
    }
  })

  it('every bundle has a defaultTabId that exists in its tab list', () => {
    for (const def of ALL_MODES) {
      const b = getRsBundle(def.id)
      expect(b.tabs.some(t => t.id === b.defaultTabId)).toBe(true)
    }
  })

  it('each compute returns a stable object for empty deps', () => {
    const deps = {
      pages: [], industry: 'general' as const, domain: '',
      filters: {}, integrationConnections: {}, wqaState: {}, wqaFilter: 'all' as const,
    }
    for (const def of ALL_MODES) {
      const b = getRsBundle(def.id)
      const stats = b.computeStats(deps as never)
      const stats2 = b.computeStats(deps as never)
      expect(JSON.stringify(stats)).toBe(JSON.stringify(stats2))
    }
  })
})
