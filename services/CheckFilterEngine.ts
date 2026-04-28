import {
    CHECK_REGISTRY,
    type AuditMode,
    type CheckCategory,
    type CheckDefinition,
    type IndustryFilter
} from './CheckRegistry';

export interface AuditFilterState {
    modes: AuditMode[];
    industry: IndustryFilter;
    customOverrides?: {
        enabled: string[];
        disabled: string[];
    };
}

export const DEFAULT_FILTER_STATE: AuditFilterState = {
    modes: ['fullAudit'],
    industry: 'all'
};

export function getActiveChecks(state: AuditFilterState): CheckDefinition[] {
    const { modes, industry, customOverrides } = state;
    const normalizedModes = modes.length > 0 ? modes : ['fullAudit'];
    const isFullMode = normalizedModes.includes('fullAudit');

    return CHECK_REGISTRY.filter((check) => {
        if (customOverrides?.disabled?.includes(check.id)) return false;
        if (customOverrides?.enabled?.includes(check.id)) return true;

        const modeMatch = isFullMode || check.auditModes.some((mode) => normalizedModes.includes(mode));
        const isIndustrySpecific = !check.industries.includes('all');
        const industryMatch = check.industries.includes(industry);

        if (isIndustrySpecific) {
            if (industry === 'all') return false;
            return industryMatch;
        }

        if (industry === 'all') {
            return modeMatch;
        }

        return modeMatch || industryMatch;
    });
}

export function getActiveCheckIds(state: AuditFilterState): Set<string> {
    return new Set(getActiveChecks(state).map((check) => check.id));
}

export function getActiveCheckCountByTier(state: AuditFilterState): Record<number, number> {
    const checks = getActiveChecks(state);
    return {
        1: checks.filter((check) => check.tier === 1).length,
        2: checks.filter((check) => check.tier === 2).length,
        3: checks.filter((check) => check.tier === 3).length,
        4: checks.filter((check) => check.tier === 4).length
    };
}

export function getActiveCheckCategories(state: AuditFilterState): Set<CheckCategory> {
    return new Set(getActiveChecks(state).map((check) => check.category));
}

