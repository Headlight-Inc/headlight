import React from 'react'
import { Chip } from '../Chip'
import type { RsSourceTier, RsSource } from './types'

const TIER_TONE: Record<RsSourceTier, 'good' | 'info' | 'warn' | 'bad' | 'neutral'> = {
  authoritative: 'good',
  'free-api':    'info',
  scrape:        'neutral',
  ai:            'info',
  est:           'warn',
  default:       'bad',
}

export function SourceChip({ source }: { source: RsSource }) {
  return <Chip tone={TIER_TONE[source.tier]} dense>{source.name}</Chip>
}
