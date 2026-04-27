// packages/modes/src/registry.ts
import type { ActionCode, Capability, Industry, Mode } from '@headlight/types';

export interface ModeView {
	id: string;
	kind: 'table' | 'dashboard' | 'graph' | 'timeline' | 'map' | 'reports';
	label: string;
	shortcut?: string;
	badge?: 'count';
	requires?: ReadonlyArray<Capability>;
	submodes?: ReadonlyArray<{ id: string; label: string }>;
}

export interface ModeDescriptor {
	id: Mode;
	label: string;
	accent: string;
	description: string;
	shortcut: string;
	defaultViewId: string;
	views: ReadonlyArray<ModeView>;
	lsSections: ReadonlyArray<{ id: string; label: string; type: 'list' | 'facet' | 'saved-views' | 'kpi' }>;
	rsTabs: ReadonlyArray<{ id: string; label: string }>;
	actionCodes: ReadonlyArray<ActionCode>;
	industryOverlays?: ReadonlyArray<Industry>; // industries that add extra columns/checks in this mode
	requiresCapabilities?: ReadonlyArray<Capability>;
	visible?: ReadonlyArray<string>; // default visible metrics
}

const DEFS = new Map<Mode, ModeDescriptor>();

export function registerMode(d: ModeDescriptor) {
  if (DEFS.has(d.id)) return; // Idempotent: ignore if already registered
  DEFS.set(d.id, d);
}

export function getMode(id: Mode): ModeDescriptor {
  const m = DEFS.get(id);
  if (!m) throw new Error(`Unknown mode: ${id}`);
  return m;
}

export function allModes(): ReadonlyArray<ModeDescriptor> {
  return [...DEFS.values()];
}

export function registerAllModes() {
  registerFullAuditMode();
  registerWqaMode();
  registerTechnicalMode();
  registerContentMode();
  registerLinksAuthorityMode();
  registerUxConversionMode();
  registerPaidMode();
  registerCommerceMode();
  registerSocialBrandMode();
  registerAiMode();
  registerCompetitorsMode();
  registerLocalMode();
}

import { registerAiMode } from './definitions/ai';
import { registerCommerceMode } from './definitions/commerce';
import { registerCompetitorsMode } from './definitions/competitors';
import { registerContentMode } from './definitions/content';
import { registerFullAuditMode } from './definitions/full-audit';
import { registerLinksAuthorityMode } from './definitions/links-authority';
import { registerLocalMode } from './definitions/local';
import { registerPaidMode } from './definitions/paid';
import { registerSocialBrandMode } from './definitions/social-brand';
import { registerTechnicalMode } from './definitions/technical';
import { registerUxConversionMode } from './definitions/ux-conversion';
import { registerWqaMode } from './definitions/wqa';
