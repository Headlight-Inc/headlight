import React from 'react'
import { Chip } from '../Chip'
import { ago } from '../formatters'

export function FreshnessChip({ at }: { at?: number }) {
  if (!at) return <Chip tone="neutral" dense>unknown</Chip>
  const ageMs = Date.now() - at
  const tone = ageMs < 60 * 60_000 ? 'good'
    : ageMs < 24 * 60 * 60_000 ? 'info'
    : ageMs < 7 * 24 * 60 * 60_000 ? 'warn' : 'bad'
  return <Chip tone={tone} dense>{ago(at)}</Chip>
}
