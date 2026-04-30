import type { Mode, RsModeBundle } from './types'
import { fullAuditBundle }     from './fullAudit'
import { wqaBundle }           from './wqa'
import { technicalBundle }     from './technical'
import { contentBundle }       from './content'
import { linksAuthorityBundle } from './linksAuthority'
import { uxConversionBundle } from './uxConversion'
import { paidBundle }         from './paid'
import { commerceBundle }     from './commerce'
import { socialBrandBundle }  from './socialBrand'
import { aiBundle }            from './ai'
import { competitorsBundle }  from './competitors'
import { localBundle }         from './local'

const REGISTRY: Record<Mode, RsModeBundle<any>> = {
  fullAudit:      fullAuditBundle,
  wqa:            wqaBundle,
  technical:      technicalBundle,
  content:        contentBundle,
  linksAuthority: linksAuthorityBundle,
  uxConversion:   uxConversionBundle,
  paid:           paidBundle,
  commerce:       commerceBundle,
  socialBrand:    socialBrandBundle,
  ai:             aiBundle,
  competitors:    competitorsBundle,
  local:          localBundle,
}

export function getRsBundle(mode: Mode): RsModeBundle<any> | null {
  return REGISTRY[mode] ?? null
}

export const RS_BUNDLES = REGISTRY
