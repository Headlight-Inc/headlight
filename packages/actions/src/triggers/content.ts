// packages/actions/src/triggers/content.ts
import type { ProposedAction } from '../ProposedAction';
import { getAction } from '../catalog';

export function triggerThinContent(page: any): ProposedAction[] {
	const wordCount = page['p.content.wordCount'] ?? page['wordCount'] ?? 0;
	if (wordCount > 0 && wordCount < 300) {
		const def = getAction('C01')!;
		return [{
			code: 'C01',
			scope: 'page',
			scopeId: page.url,
			severity: def.severity,
			trace: [{ key: 'p.content.wordCount', value: wordCount }],
		}];
	}
	return [];
}
