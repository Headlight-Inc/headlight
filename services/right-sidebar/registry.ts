import type { RsModeBundle } from './types'
import type { Mode } from '@headlight/types'

import { fullAuditBundle }     from './fullAudit'
import { wqaBundle }            from './wqa'
import { technicalBundle }      from './technical'
import { contentBundle }        from './content'
import { linksAuthorityBundle } from './linksAuthority'
import { uxConversionBundle }   from './uxConversion'
import { paidBundle }           from './paid'
import { commerceBundle }       from './commerce'
import { socialBundle }         from './socialBrand'
import { aiBundle }              from './ai'
import { competitorsBundle }    from './competitors'
import { localBundle }           from './local'

export function getRsBundle(mode: Mode): RsModeBundle<unknown> {
  switch (mode) {
    case 'fullAudit':     return fullAuditBundle as RsModeBundle<unknown>
    case 'wqa':           return wqaBundle       as RsModeBundle<unknown>
    case 'technical':     return technicalBundle as RsModeBundle<unknown>
    case 'content':       return contentBundle   as RsModeBundle<unknown>
    case 'linksAuthority': return linksAuthorityBundle as RsModeBundle<unknown>
    case 'uxConversion':  return uxConversionBundle as RsModeBundle<unknown>
    case 'paid':          return paidBundle      as RsModeBundle<unknown>
    case 'commerce':      return commerceBundle  as RsModeBundle<unknown>
    case 'socialBrand':   return socialBundle    as RsModeBundle<unknown>
    case 'ai':             return aiBundle         as RsModeBundle<unknown>
    case 'competitors':    return competitorsBundle as RsModeBundle<unknown>
    case 'local':          return localBundle      as RsModeBundle<unknown>
    default: return fullAuditBundle as RsModeBundle<unknown>
  }
}
