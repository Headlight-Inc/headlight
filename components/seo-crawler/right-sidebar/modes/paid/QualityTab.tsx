import * as React from 'react'
import { Card, SectionTitle } from '../../shared/primitives'
import { StackedBar } from '../../shared/charts'
import type { RsTabProps } from '@/services/right-sidebar/types'
import type { PaidStats } from '@/services/right-sidebar/paid'

export function QualityTab({ stats }: RsTabProps<PaidStats>) {
	const parts = [
		{ value: stats.quality.good, color: '#34d399', label: 'Good' },
		{ value: stats.quality.medium, color: '#fbbf24', label: 'Medium' },
		{ value: stats.quality.poor, color: '#fb7185', label: 'Poor' },
	]
	return (
		<div className="space-y-4">
			<SectionTitle>Landing page quality mix</SectionTitle>
			<Card><StackedBar parts={parts} /></Card>
		</div>
	)
}
