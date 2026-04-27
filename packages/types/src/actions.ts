// packages/types/src/actions.ts
import type { Mode } from './modes';
import type { Industry } from './industries';
import type { Capability } from './metric-def';

export type ActionCode = string;

export type SeverityBand = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'HYGIENE' | 'STRATEGIC';

export type ActionUnits = 'page' | 'site' | 'cluster';

export type ForecastUnit = 'clicks' | 'sessions' | 'conversions' | 'revenue' | 'impressions' | 'none';

export interface ActionDescriptor {
	code: ActionCode;
	title: string;
	description: string;
	modes: ReadonlyArray<Mode>;
	industries?: ReadonlyArray<Industry>;
	severity: SeverityBand;
	effortMinutes: number;
	impactHint: 'high' | 'medium' | 'low';
	requires: ReadonlyArray<string>;          // metric keys the trigger consumes
	capabilityRequires: ReadonlyArray<Capability>;
	triggerKey: string;
	forecastUnit: ForecastUnit;
	bandHint: SeverityBand;
	units: ActionUnits;
	autoRunCapable: boolean;
	fallback?: ActionCode;                    // sibling code to fall back to when capability missing
}
