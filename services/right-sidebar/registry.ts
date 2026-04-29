import type { ModeId } from '@headlight/modes'
import type { RsModeBundle } from './types'
// import { fullAuditBundle } from './full-audit'
import { wqaBundle } from './wqa/index'
import { technicalBundle } from './technical'
import { contentBundle } from './content'
import { linksBundle } from './links'
import { uxBundle } from './ux'
import { paidBundle } from './paid'
import { commerceBundle } from './commerce'
import { socialBundle } from './social'
import { aiBundle } from './ai'
import { competitorsBundle } from './competitors'
import { localBundle } from './local'

export const rsRegistry: Record<ModeId, RsModeBundle<any>> = {
	// fullAudit: fullAuditBundle,
	wqa: wqaBundle,
	technical: technicalBundle,
	content: contentBundle,
	linksAuthority: linksBundle,
	uxConversion: uxBundle,
	paid: paidBundle,
	commerce: commerceBundle,
	socialBrand: socialBundle,
	ai: aiBundle,
	competitors: competitorsBundle,
	local: localBundle,
}
