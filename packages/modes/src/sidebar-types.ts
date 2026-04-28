import type { Mode } from './modes';

// What kind of UI block a section renders as.
export type SectionKind = 'kpi' | 'list' | 'facet' | 'saved-views';

// Visual tone for a row's count chip / left dot.
export type RowTone = 'good' | 'warn' | 'bad' | 'info' | 'neutral';

// A single, statically defined item (used by 'list' sections).
export interface SidebarListItem {
	id: string;                // stable id; also the selection value if selectionKey is set
	label: string;             // display text
	icon?: string;             // lucide icon name (string, looked up by SidebarTreeRow)
	meta?: string;             // right-side small text (count, %, ★ rating, etc.)
	tone?: RowTone;
	children?: ReadonlyArray<SidebarListItem>;
	action?: 'compare' | 'add' | 'newCrawl';   // renders the row as a + action
	shortcut?: string;         // e.g. '1', '2', 'g a'
	bullet?: string;           // override character (if section.bullet === 'bucket')
	metaStyle?: 'badge' | 'text'; // force meta to render as a badge
	indicator?: 'dot';         // show a status dot separate from meta
}

// A single facet bucket, defined once and populated at runtime by SidebarFacets.
export interface SidebarFacetBucket {
	value: string;             // selection value written to pageFilter
	label: string;             // display label (run through formatFacetLabel if needed)
	tone?: RowTone;
	hidden?: (count: number) => boolean;   // hide the row if true; default: count === 0
	dim?:    (count: number) => boolean;   // dim the row if true; default: count === 0
	shortcut?: string;
	bullet?: string;           // override character (if section.bullet === 'bucket')
}

// Common to every section.
export interface SidebarSectionBase {
	id: string;                // stable id; persisted in collapsedSections map
	label: string;             // group header text (uppercase, 11px)
	defaultOpen?: boolean;     // default true
	selectionMode?: 'single' | 'multi';  // default 'multi' for facets, 'single' for lists
	selectionKey?: string;     // which key in pageFilter.selections this section writes
	description?: string;      // optional tooltip on the (?) badge
	hideWhenEmpty?: boolean;   // hide the whole section if it has no items / facets
	pinned?: boolean;          // if true, section is fixed at the top (outside scroll area)
}

export interface SidebarKpiSection extends SidebarSectionBase {
	kind: 'kpi';
	// runtime resolver returns one tile worth of data
	compute: (ctx: { pages: ReadonlyArray<unknown>; mode: Mode }) => {
		value: number | string;
		delta?: number;
		unit?: string;
		tone?: RowTone;
	};
}

export interface SidebarListSection extends SidebarSectionBase {
	kind: 'list';
	items: ReadonlyArray<SidebarListItem>;
	bullet?: 'check' | 'square-check' | 'arrow' | 'dot' | 'dot-filled' | 'dot-outline' | 'diamond' | 'win-loss' | 'bucket' | 'branch';
	// optional runtime resolver for dynamic lists (sessions, locations, competitors).
	resolveItems?: (ctx: { pages: ReadonlyArray<unknown>; mode: Mode }) => ReadonlyArray<SidebarListItem>;
}

export interface SidebarFacetSection extends SidebarSectionBase {
	kind: 'facet';
	countKey: string;          // key consumed by SidebarFacets.computeFacets
	buckets?: ReadonlyArray<SidebarFacetBucket>;  // ordered, exhaustive
	maxVisible?: number;       // default 8 then "Show all"
	bullet?: 'check' | 'square-check' | 'arrow' | 'dot' | 'dot-filled' | 'dot-outline' | 'diamond' | 'win-loss' | 'bucket' | 'branch';
	display?: 'histogram';
}

export interface SidebarSavedViewsSection extends SidebarSectionBase {
	kind: 'saved-views';
	defaultViews?: ReadonlyArray<SavedViewSeed>;  // seeded into store on first run
}

export type SidebarSection =
	| SidebarKpiSection
	| SidebarListSection
	| SidebarFacetSection
	| SidebarSavedViewsSection;

// Saved views
export interface SavedView {
	id: string;
	name: string;
	mode: Mode;
	selections: Record<string, ReadonlyArray<string>>;
	createdAt: number;
	updatedAt: number;
	count?: number;            // last computed match count (display only)
}

export type SavedViewSeed = Omit<SavedView, 'id' | 'createdAt' | 'updatedAt' | 'count'>;
