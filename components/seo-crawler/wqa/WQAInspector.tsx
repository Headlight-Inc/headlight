import React, { useMemo, useState } from 'react';
import { ExternalLink, MessageSquare, UserPlus, X, Check } from 'lucide-react';
import type { DetectedIndustry } from '../../../services/SiteTypeDetector';
import { getConversionLabel, getConversionValue } from '../../../services/WebsiteQualityModeTypes';
import { getExpectedCtr } from '../../../services/ExpectedCtrCurve';

export type WqaInspectorTab = 'summary' | 'search' | 'content' | 'links' | 'actions' | 'ai' | 'source';

interface WQAInspectorProps {
  page: any;
  industry: DetectedIndustry;
  language: string;
  onClose: () => void;
  onAssign?: (url: string) => void;
  onComment?: (url: string) => void;
  onApplyAISuggestion?: (url: string, field: string, value: string) => void;
  onRegenerateAI?: (url: string) => void;
  onOpenExternal?: (url: string) => void;
}

const TABS: Array<{ id: WqaInspectorTab; label: string }> = [
  { id: 'summary', label: 'Summary' },
  { id: 'search', label: 'Search' },
  { id: 'content', label: 'Content' },
  { id: 'links', label: 'Links' },
  { id: 'actions', label: 'Actions' },
  { id: 'ai', label: 'AI' },
  { id: 'source', label: 'Source' },
];

export default function WQAInspector({
  page,
  industry,
  language,
  onClose,
  onAssign,
  onComment,
  onApplyAISuggestion,
  onRegenerateAI,
  onOpenExternal,
}: WQAInspectorProps) {
  const [activeTab, setActiveTab] = useState<WqaInspectorTab>('summary');

  if (!page) return null;

  const pagePath = useMemo(() => {
    try {
      return new URL(page.url).pathname;
    } catch {
      return page.url;
    }
  }, [page.url]);

  return (
    <div className="flex h-full flex-col border-t border-[#222] bg-[#0d0d0f] text-[#e0e0e0]">
      <div className="flex shrink-0 items-center justify-between border-b border-[#1a1a1a] bg-[#0a0a0a] px-4 py-2">
        <div className="flex min-w-0 items-center gap-3">
          <span className="max-w-[360px] truncate font-mono text-[12px] text-white" title={page.url}>
            {pagePath}
          </span>
          <span className="rounded border border-[#222] bg-[#1a1a1a] px-1.5 py-0.5 text-[10px] text-[#888]">
            {formatCat(page.pageCategory)}
          </span>
          {page.pageValueTier && <span className="text-[10px] text-yellow-400">{page.pageValueTier}</span>}
          {page.healthScore != null && (
            <span
              className={`text-[10px] font-medium ${
                page.healthScore >= 70
                  ? 'text-green-400'
                  : page.healthScore >= 40
                    ? 'text-yellow-400'
                    : 'text-red-400'
              }`}
            >
              Health: {Math.round(page.healthScore)}
            </span>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          {onAssign && (
            <button
              onClick={() => onAssign(page.url)}
              className="rounded p-1.5 text-[#666] transition-colors hover:bg-[#1a1a1a] hover:text-[#ccc]"
              title="Assign"
            >
              <UserPlus size={14} />
            </button>
          )}
          {onComment && (
            <button
              onClick={() => onComment(page.url)}
              className="rounded p-1.5 text-[#666] transition-colors hover:bg-[#1a1a1a] hover:text-[#ccc]"
              title="Comment"
            >
              <MessageSquare size={14} />
            </button>
          )}
          {onOpenExternal && (
            <button
              onClick={() => onOpenExternal(page.url)}
              className="rounded p-1.5 text-[#666] transition-colors hover:bg-[#1a1a1a] hover:text-[#ccc]"
              title="Open URL"
            >
              <ExternalLink size={14} />
            </button>
          )}
          <button
            onClick={onClose}
            className="rounded p-1.5 text-[#666] transition-colors hover:bg-[#1a1a1a] hover:text-white"
            title="Close"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      <div className="flex shrink-0 border-b border-[#1a1a1a] bg-[#0a0a0a] px-2">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`whitespace-nowrap border-b-2 px-3 py-2 text-[11px] font-medium transition-colors ${
              activeTab === tab.id
                ? 'border-[#F5364E] text-white'
                : 'border-transparent text-[#666] hover:text-[#aaa]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="custom-scrollbar flex-1 overflow-y-auto p-4 text-[12px] leading-relaxed">
        {activeTab === 'summary' && <SummaryTab page={page} industry={industry} />}
        {activeTab === 'search' && <SearchTab page={page} />}
        {activeTab === 'content' && <ContentTab page={page} language={language} />}
        {activeTab === 'links' && <LinksTab page={page} />}
        {activeTab === 'actions' && <ActionsTab page={page} onApplyAISuggestion={onApplyAISuggestion} />}
        {activeTab === 'ai' && <AITab page={page} onRegenerate={onRegenerateAI} />}
        {activeTab === 'source' && <SourceTab page={page} />}
      </div>
    </div>
  );
}

function SummaryTab({ page, industry }: { page: any; industry: DetectedIndustry }) {
  const convLabel = getConversionLabel(industry);
  const convValue = getConversionValue(page, industry);
  const impressions = num(page.gscImpressions);
  const position = num(page.gscPosition);
  const ctr = num(page.gscCtr);
  const expectedCtr = position > 0 ? getExpectedCtr(position) : 0;

  return (
    <div className="space-y-3">
      <Row>
        <Pill
          label="Status"
          value={page.statusCode}
          color={page.statusCode === 200 ? 'green' : page.statusCode >= 400 ? 'red' : 'yellow'}
        />
        <Pill label="Index" value={page.indexable === false ? 'No' : 'Yes'} color={page.indexable === false ? 'red' : 'green'} />
        <Pill label="Sitemap" value={page.inSitemap ? 'Yes' : 'No'} color={page.inSitemap ? 'green' : 'yellow'} />
        <Pill label="Depth" value={page.crawlDepth ?? '—'} />
        <Pill
          label="Speed"
          value={page.speedScore || '—'}
          color={page.speedScore === 'Good' ? 'green' : page.speedScore === 'Poor' ? 'red' : 'yellow'}
        />
      </Row>

      <Section title="SEO">
        <Field label="Title" value={page.title || '(empty)'} warn={!page.title} suffix={page.title ? `${page.title.length}ch` : undefined} />
        <Field label="Meta" value={page.metaDesc || '(empty)'} warn={!page.metaDesc} suffix={page.metaDesc ? `${page.metaDesc.length}ch` : undefined} />
        <Field
          label="H1"
          value={page.h1_1 || '(empty)'}
          warn={!page.h1_1}
          suffix={page.h1_1 ? (page.multipleH1s ? 'multiple' : '1') : undefined}
        />
        <Field label="Words" value={num(page.wordCount).toLocaleString()} />
      </Section>

      <Section title="Search Performance">
        <div className="grid grid-cols-4 gap-3">
          <MiniStat label="Main KW" value={page.mainKeyword || '—'} />
          <MiniStat label="Position" value={position > 0 ? Math.round(position).toString() : '—'} />
          <MiniStat label="Impressions" value={impressions > 0 ? formatCompact(impressions) : '—'} />
          <MiniStat
            label="CTR"
            value={ctr > 0 ? `${(ctr * 100).toFixed(1)}%` : '—'}
            sub={expectedCtr > 0 ? `exp: ${(expectedCtr * 100).toFixed(1)}%` : undefined}
          />
        </div>
      </Section>

      <Section title="Traffic & Engagement">
        <div className="grid grid-cols-4 gap-3">
          <MiniStat label="Sessions" value={formatCompact(num(page.ga4Sessions))} />
          <MiniStat label="Bounce" value={num(page.ga4BounceRate) > 0 ? `${Math.round(num(page.ga4BounceRate) * 100)}%` : '—'} />
          <MiniStat label="Avg Time" value={page.ga4AvgSessionDuration ? formatDuration(num(page.ga4AvgSessionDuration)) : '—'} />
          <MiniStat
            label={convLabel}
            value={
              convValue > 0
                ? industry === 'ecommerce'
                  ? `$${convValue.toLocaleString()}`
                  : convValue.toLocaleString()
                : '—'
            }
          />
        </div>
      </Section>

      <Section title="Authority">
        <div className="grid grid-cols-4 gap-3">
          <MiniStat label="Backlinks" value={formatCompact(num(page.backlinks))} />
          <MiniStat label="Ref. Domains" value={formatCompact(num(page.referringDomains))} />
          <MiniStat label="Inlinks" value={num(page.inlinks).toString()} />
          <MiniStat label="Outlinks" value={num(page.outlinks || page.uniqueOutlinks).toString()} />
        </div>
      </Section>

      <Section title="Actions">
        <ActionLine label="Technical" action={page.technicalAction} reason={page.technicalActionReason} />
        <ActionLine label="Content" action={page.contentAction} reason={page.contentActionReason} />
      </Section>
    </div>
  );
}

function SearchTab({ page }: { page: any }) {
  const position = num(page.gscPosition);
  const ctr = num(page.gscCtr);
  const expectedCtr = position > 0 ? getExpectedCtr(position) : 0;
  const ctrGap = num(page.ctrGap);

  return (
    <div className="space-y-3">
      <Section title="Keyword Ranking">
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded border border-[#222] bg-[#111] p-2.5">
            <div className="mb-1 text-[10px] uppercase text-[#666]">Main Keyword</div>
            <div className="text-[13px] font-medium text-white">{page.mainKeyword || '—'}</div>
            <div className="mt-1 text-[10px] text-[#888]">
              Vol: {formatCompact(num(page.mainKwVolume))} · Pos: {num(page.mainKwPosition) > 0 ? Math.round(num(page.mainKwPosition)) : '—'}
            </div>
          </div>
          <div className="rounded border border-[#222] bg-[#111] p-2.5">
            <div className="mb-1 text-[10px] uppercase text-[#666]">Best Keyword</div>
            <div className="text-[13px] font-medium text-white">{page.bestKeyword || '—'}</div>
            <div className="mt-1 text-[10px] text-[#888]">
              Vol: {formatCompact(num(page.bestKwVolume))} · Pos: {num(page.bestKwPosition) > 0 ? Math.round(num(page.bestKwPosition)) : '—'}
            </div>
          </div>
        </div>
      </Section>

      <Section title="Performance">
        <div className="grid grid-cols-4 gap-3">
          <MiniStat label="Impressions" value={formatCompact(num(page.gscImpressions))} />
          <MiniStat label="Clicks" value={formatCompact(num(page.gscClicks))} />
          <MiniStat label="CTR" value={ctr > 0 ? `${(ctr * 100).toFixed(1)}%` : '—'} />
          <MiniStat label="Avg Position" value={position > 0 ? position.toFixed(1) : '—'} />
        </div>
        {ctrGap !== 0 && position > 0 && (
          <div
            className={`mt-2 rounded border px-2.5 py-1.5 text-[11px] ${
              ctrGap < -0.02
                ? 'border-red-500/20 bg-red-500/5 text-red-400'
                : 'border-green-500/20 bg-green-500/5 text-green-400'
            }`}
          >
            CTR is {ctrGap < 0 ? `${Math.abs(ctrGap * 100).toFixed(1)}% below` : `${(ctrGap * 100).toFixed(1)}% above`} expected for
            position {Math.round(position)} (expected {(expectedCtr * 100).toFixed(1)}%)
          </div>
        )}
      </Section>

      <Section title="Intent">
        <div className="grid grid-cols-3 gap-3">
          <MiniStat label="Page Intent" value={page.searchIntent || '—'} />
          <MiniStat label="KW Intent" value={page.kwIntent || '—'} />
          <MiniStat
            label="Match"
            value={page.intentMatch === 'aligned' ? 'Aligned' : page.intentMatch === 'misaligned' ? 'Misaligned' : '—'}
          />
        </div>
      </Section>

      {page.isCannibalized && (
        <div className="rounded border border-orange-500/20 bg-orange-500/5 px-2.5 py-1.5 text-[11px] text-orange-400">
          This page may be competing with other pages for "{page.mainKeyword}"
        </div>
      )}

      {page.isLosingTraffic && (
        <div className="rounded border border-red-500/20 bg-red-500/5 px-2.5 py-1.5 text-[11px] text-red-400">
          Traffic declining. Sessions dropped {Math.abs(Math.round(num(page.sessionsDeltaPct) * 100))}% vs previous period
        </div>
      )}
    </div>
  );
}

function ContentTab({ page, language }: { page: any; language: string }) {
  const isEnglish = language.startsWith('en');

  return (
    <div className="space-y-3">
      <Section title="Quality">
        <div className="grid grid-cols-4 gap-3">
          <MiniStat label="Quality" value={num(page.contentQualityScore) > 0 ? `${Math.round(num(page.contentQualityScore))}/100` : '—'} />
          <MiniStat label="E-E-A-T" value={num(page.eeatScore) > 0 ? `${Math.round(num(page.eeatScore))}/100` : '—'} />
          <MiniStat label="Readability" value={isEnglish ? (page.readability || '—') : `${page.readability || '—'} *`} />
          <MiniStat label="Sentiment" value={page.sentiment || '—'} />
        </div>
        {!isEnglish && page.readability && <div className="mt-1 text-[10px] text-[#555]">* Readability is approximate for non-English content</div>}
      </Section>

      <Section title="Structure">
        <Field label="Schema" value={(page.schemaTypes || []).length > 0 ? (page.schemaTypes || []).join(', ') : 'None'} warn={(page.schemaTypes || []).length === 0} />
        <Field label="OG Tags" value={page.ogTitle ? 'Present' : 'Missing'} warn={!page.ogTitle} />
        <Field label="Twitter" value={page.hasTwitterCard ? 'Present' : 'Missing'} warn={!page.hasTwitterCard} />
        <Field label="Headings" value={`H1(${page.h1_1 ? (page.multipleH1s ? '2+' : '1') : '0'}) H2(${page.h2_1 ? '1+' : '0'})`} />
        <Field
          label="Images"
          value={`${num(page.totalImages)} total${num(page.missingAltImages) > 0 ? `, ${num(page.missingAltImages)} missing alt` : ''}`}
          warn={num(page.missingAltImages) > 0}
        />
      </Section>

      <Section title="Status">
        <Field label="Words" value={num(page.wordCount).toLocaleString()} warn={num(page.wordCount) < 200 && num(page.wordCount) > 0} />
        <Field label="Content Age" value={page.visibleDate ? formatAge(page.visibleDate) : page.lastModified ? formatAge(page.lastModified) : '—'} />
        <Field
          label="Duplicate"
          value={page.exactDuplicate ? 'Exact duplicate' : page.isDuplicate ? 'Near-duplicate' : 'Unique'}
          warn={page.exactDuplicate || page.isDuplicate}
        />
        <Field label="Thin" value={page.isThinContent ? 'Thin content' : 'OK'} warn={page.isThinContent} />
      </Section>
    </div>
  );
}

function LinksTab({ page }: { page: any }) {
  const [showAllInlinks, setShowAllInlinks] = useState(false);
  const [showAllOutlinks, setShowAllOutlinks] = useState(false);

  const inlinks = Array.isArray(page.inlinksList) ? page.inlinksList : [];
  const outlinks = Array.isArray(page.outlinksList) ? page.outlinksList : [];
  const externalLinks = Array.isArray(page.externalLinks) ? page.externalLinks : [];

  const visibleInlinks = showAllInlinks ? inlinks : inlinks.slice(0, 8);
  const visibleOutlinks = showAllOutlinks ? outlinks : outlinks.slice(0, 8);

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-4 gap-3">
        <MiniStat label="Internal In" value={num(page.inlinks).toString()} />
        <MiniStat label="Internal Out" value={num(page.outlinks || page.uniqueOutlinks).toString()} />
        <MiniStat label="External Out" value={num(page.externalOutlinks || page.uniqueExternalOutlinks).toString()} />
        <MiniStat label="Broken" value={num(page.brokenInternalLinks).toString()} />
      </div>

      <div className="grid grid-cols-3 gap-3">
        <MiniStat label="PageRank" value={num(page.internalPageRank) > 0 ? `${Math.round(num(page.internalPageRank))}/100` : '—'} />
        <MiniStat label="Link Equity" value={num(page.linkEquity) > 0 ? `${Math.round(num(page.linkEquity))}/10` : '—'} />
        <MiniStat label="Orphan" value={num(page.inlinks) === 0 && num(page.crawlDepth) > 0 ? 'Yes' : 'No'} />
      </div>

      <Section title={`Inbound (${inlinks.length})`}>
        {inlinks.length === 0 ? (
          <span className="text-[#555]">No internal pages link to this page</span>
        ) : (
          <>
            <div className="space-y-0.5">
              {visibleInlinks.map((url: string, i: number) => (
                <div key={i} className="truncate font-mono text-[11px] text-[#888]">{tryPath(url)}</div>
              ))}
            </div>
            {inlinks.length > 8 && !showAllInlinks && (
              <button onClick={() => setShowAllInlinks(true)} className="mt-1 text-[10px] text-[#F5364E] hover:underline">
                Show all {inlinks.length}
              </button>
            )}
          </>
        )}
      </Section>

      <Section title={`Outbound Internal (${outlinks.length})`}>
        {outlinks.length === 0 ? (
          <span className="text-[#555]">No internal outgoing links</span>
        ) : (
          <>
            <div className="space-y-0.5">
              {visibleOutlinks.map((url: string, i: number) => (
                <div key={i} className="truncate font-mono text-[11px] text-[#888]">{tryPath(url)}</div>
              ))}
            </div>
            {outlinks.length > 8 && !showAllOutlinks && (
              <button onClick={() => setShowAllOutlinks(true)} className="mt-1 text-[10px] text-[#F5364E] hover:underline">
                Show all {outlinks.length}
              </button>
            )}
          </>
        )}
      </Section>

      {externalLinks.length > 0 && (
        <Section title={`External (${externalLinks.length})`}>
          <div className="space-y-0.5">
            {externalLinks.slice(0, 6).map((url: string, i: number) => (
              <div key={i} className="truncate font-mono text-[11px] text-[#888]">{url}</div>
            ))}
            {externalLinks.length > 6 && <span className="text-[10px] text-[#555]">+{externalLinks.length - 6} more</span>}
          </div>
        </Section>
      )}
    </div>
  );
}

function ActionsTab({ page, onApplyAISuggestion }: { page: any; onApplyAISuggestion?: (url: string, field: string, value: string) => void }) {
  const [appliedTitle, setAppliedTitle] = useState(false);
  const [appliedMeta, setAppliedMeta] = useState(false);

  return (
    <div className="space-y-4">
      <ActionDetail
        category="Technical"
        action={page.technicalAction}
        reason={page.technicalActionReason}
        impact={num(page.estimatedImpact)}
        color="#6366f1"
      />

      <ActionDetail
        category="Content"
        action={page.contentAction}
        reason={page.contentActionReason}
        impact={num(page.estimatedImpact)}
        color="#22c55e"
      />

      {page.contentAction === 'Rewrite Title & Meta' && (page.suggestedTitle || page.suggestedMeta) && (
        <Section title="AI Suggestions">
          {page.suggestedTitle && (
            <div className="space-y-1.5 rounded border border-[#222] bg-[#111] p-3">
              <div className="text-[10px] uppercase text-[#666]">Suggested Title</div>
              <div className="text-[12px] text-white">{page.suggestedTitle}</div>
              {onApplyAISuggestion && (
                <button
                  onClick={() => {
                    onApplyAISuggestion(page.url, 'title', page.suggestedTitle);
                    setAppliedTitle(true);
                  }}
                  className={`rounded border px-2 py-1 text-[10px] transition-colors ${
                    appliedTitle
                      ? 'border-green-500/30 bg-green-500/10 text-green-400'
                      : 'border-[#F5364E]/30 bg-[#F5364E]/10 text-[#F5364E] hover:bg-[#F5364E]/20'
                  }`}
                >
                  {appliedTitle ? (
                    <>
                      <Check size={10} className="mr-1 inline" />Applied
                    </>
                  ) : (
                    'Apply Title'
                  )}
                </button>
              )}
            </div>
          )}
          {page.suggestedMeta && (
            <div className="mt-2 space-y-1.5 rounded border border-[#222] bg-[#111] p-3">
              <div className="text-[10px] uppercase text-[#666]">Suggested Meta Description</div>
              <div className="text-[12px] text-[#ccc]">{page.suggestedMeta}</div>
              {onApplyAISuggestion && (
                <button
                  onClick={() => {
                    onApplyAISuggestion(page.url, 'metaDesc', page.suggestedMeta);
                    setAppliedMeta(true);
                  }}
                  className={`rounded border px-2 py-1 text-[10px] transition-colors ${
                    appliedMeta
                      ? 'border-green-500/30 bg-green-500/10 text-green-400'
                      : 'border-[#F5364E]/30 bg-[#F5364E]/10 text-[#F5364E] hover:bg-[#F5364E]/20'
                  }`}
                >
                  {appliedMeta ? (
                    <>
                      <Check size={10} className="mr-1 inline" />Applied
                    </>
                  ) : (
                    'Apply Meta'
                  )}
                </button>
              )}
            </div>
          )}
        </Section>
      )}

      {Array.isArray(page.fixSuggestions) && page.fixSuggestions.length > 0 && (
        <Section title="Fix Suggestions">
          {page.fixSuggestions.map((fix: any, i: number) => (
            <div key={i} className="mb-2 rounded border border-[#222] bg-[#111] p-2.5">
              <div className="text-[11px] font-medium text-white">{fix.fix || fix.title || `Fix ${i + 1}`}</div>
              {fix.impact && <div className="mt-0.5 text-[10px] text-[#888]">Impact: {fix.impact}</div>}
              {fix.effort && <div className="text-[10px] text-[#888]">Effort: {fix.effort}</div>}
              {fix.code && (
                <pre className="mt-1.5 overflow-x-auto rounded bg-[#0a0a0a] p-2 font-mono text-[10px] text-[#aaa]">
                  {fix.code}
                </pre>
              )}
            </div>
          ))}
        </Section>
      )}
    </div>
  );
}

function AITab({ page, onRegenerate }: { page: any; onRegenerate?: (url: string) => void }) {
  return (
    <div className="space-y-3">
      {page.aiSummary || page.summary ? (
        <Section title="Summary">
          <p className="leading-relaxed text-[12px] text-[#ccc]">{page.aiSummary || page.summary}</p>
        </Section>
      ) : (
        <div className="text-[11px] text-[#555]">No AI analysis available for this page.</div>
      )}

      <Section title="Classification">
        <div className="grid grid-cols-3 gap-3">
          <MiniStat label="Topic Cluster" value={page.topicCluster || '—'} />
          <MiniStat label="Primary Topic" value={page.primaryTopic || '—'} />
          <MiniStat label="Funnel Stage" value={page.funnelStage || '—'} />
        </div>
      </Section>

      {page.eeatBreakdown && (
        <Section title="E-E-A-T Breakdown">
          <div className="grid grid-cols-4 gap-3">
            <MiniStat label="Experience" value={page.eeatBreakdown.experience?.toString() || '—'} />
            <MiniStat label="Expertise" value={page.eeatBreakdown.expertise?.toString() || '—'} />
            <MiniStat label="Authority" value={page.eeatBreakdown.authoritativeness?.toString() || '—'} />
            <MiniStat label="Trust" value={page.eeatBreakdown.trustworthiness?.toString() || '—'} />
          </div>
        </Section>
      )}

      {Array.isArray(page.extractedKeywords) && page.extractedKeywords.length > 0 && (
        <Section title="Extracted Keywords">
          <div className="flex flex-wrap gap-1.5">
            {page.extractedKeywords.slice(0, 12).map((kw: any, i: number) => (
              <span key={i} className="rounded border border-[#222] bg-[#1a1a1a] px-2 py-0.5 text-[10px] text-[#aaa]">
                {kw.phrase || kw}
              </span>
            ))}
          </div>
        </Section>
      )}

      {Array.isArray(page.gaps) && page.gaps.length > 0 && (
        <Section title="Content Gaps">
          {page.gaps.slice(0, 5).map((gap: any, i: number) => (
            <div key={i} className="mb-1 text-[11px] text-[#888]">
              <span className="text-[#ccc]">{gap.topic}</span> - {gap.reason}
            </div>
          ))}
        </Section>
      )}

      {page.aiLikelihood && (
        <div className="text-[11px] text-[#888]">
          AI-generated likelihood:{' '}
          <span className={page.aiLikelihood === 'high' ? 'text-orange-400' : 'text-[#aaa]'}>{page.aiLikelihood}</span>
        </div>
      )}

      {onRegenerate && (
        <button onClick={() => onRegenerate(page.url)} className="text-[11px] text-[#F5364E] hover:underline">
          Regenerate AI Analysis
        </button>
      )}
    </div>
  );
}

function SourceTab({ page }: { page: any }) {
  return (
    <div className="space-y-3">
      <Section title="Response">
        <Field label="Status" value={`${page.statusCode} ${page.status || ''}`} />
        <Field label="Content-Type" value={page.contentTypeMime || page.contentType || '—'} />
        <Field label="Encoding" value={page.contentEncoding || '—'} />
        <Field label="Size" value={num(page.sizeBytes) > 0 ? formatBytes(num(page.sizeBytes)) : '—'} />
        <Field label="Protocol" value={page.httpVersion || '—'} />
        <Field label="Server" value={page.responseHeaders?.server || '—'} />
      </Section>

      <Section title="Indexing">
        <Field label="Canonical" value={page.canonical || '(none)'} warn={!page.canonical} />
        <Field label="Meta Robots" value={page.metaRobots1 || 'index, follow'} />
        <Field label="X-Robots" value={page.xRobots || '(none)'} />
        <Field label="Language" value={page.language || '—'} />
      </Section>

      {page.redirectUrl && (
        <Section title="Redirect">
          <Field label="Redirect To" value={page.redirectUrl} />
          <Field label="Final URL" value={page.finalUrl || page.url} />
          <Field label="Hops" value={(page.redirectChainLength || 0).toString()} />
          <Field label="Type" value={page.redirectType || '—'} />
        </Section>
      )}

      <Section title="Speed (Raw)">
        <div className="grid grid-cols-5 gap-3">
          <MiniStat label="LCP" value={num(page.lcp) > 0 ? `${(num(page.lcp) / 1000).toFixed(1)}s` : '—'} />
          <MiniStat label="CLS" value={num(page.cls) > 0 ? num(page.cls).toFixed(2) : '—'} />
          <MiniStat label="INP" value={num(page.inp) > 0 ? `${Math.round(num(page.inp))}ms` : '—'} />
          <MiniStat label="TTFB" value={num(page.ttfb || page.loadTime) > 0 ? `${Math.round(num(page.ttfb || page.loadTime))}ms` : '—'} />
          <MiniStat label="FCP" value={num(page.fcp) > 0 ? `${(num(page.fcp) / 1000).toFixed(1)}s` : '—'} />
        </div>
      </Section>

      <Section title="Cache">
        <Field label="Cache-Control" value={page.hasCacheControl ? `max-age=${page.cacheMaxAge || '?'}` : '(none)'} />
        <Field label="ETag" value={page.hasEtag ? 'Yes' : 'No'} />
        <Field label="Last-Modified" value={page.lastModified || '(none)'} />
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h4 className="mb-2 border-b border-[#1a1a1a] pb-1 text-[10px] font-bold uppercase tracking-widest text-[#444]">{title}</h4>
      {children}
    </div>
  );
}

function Row({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-wrap items-center gap-2">{children}</div>;
}

function Pill({ label, value, color }: { label: string; value: any; color?: 'green' | 'red' | 'yellow' | undefined }) {
  const colorClass =
    color === 'green'
      ? 'border-green-500/30 text-green-400'
      : color === 'red'
        ? 'border-red-500/30 text-red-400'
        : color === 'yellow'
          ? 'border-orange-500/30 text-orange-400'
          : 'border-[#222] text-[#aaa]';

  return (
    <span className={`rounded border bg-[#111] px-2 py-0.5 text-[10px] ${colorClass}`}>
      <span className="mr-1 text-[#666]">{label}:</span>
      {String(value)}
    </span>
  );
}

function Field({ label, value, warn, suffix }: { label: string; value: string; warn?: boolean; suffix?: string }) {
  return (
    <div className="flex items-start gap-2 py-0.5">
      <span className="w-20 shrink-0 text-right text-[10px] text-[#555]">{label}</span>
      <span className={`break-all text-[11px] ${warn ? 'text-orange-400' : 'text-[#ccc]'}`}>
        {value}
        {suffix && <span className="ml-1.5 text-[#555]">({suffix})</span>}
      </span>
    </div>
  );
}

function MiniStat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded border border-[#1a1a1a] bg-[#111] p-2">
      <div className="truncate text-[12px] font-medium text-white">{value}</div>
      <div className="mt-0.5 text-[9px] uppercase text-[#555]">{label}</div>
      {sub && <div className="mt-0.5 text-[9px] text-[#444]">{sub}</div>}
    </div>
  );
}

function ActionLine({ label, action, reason }: { label: string; action?: string; reason?: string }) {
  const isNone = !action || action === 'Monitor' || action === 'No Action';
  return (
    <div className="flex items-start gap-2 py-1">
      <span className={`rounded px-1.5 py-0.5 text-[10px] ${label === 'Technical' ? 'bg-indigo-500/10 text-indigo-400' : 'bg-green-500/10 text-green-400'}`}>
        {label}
      </span>
      <div>
        <span className={`text-[11px] font-medium ${isNone ? 'text-[#555]' : 'text-white'}`}>{action || 'Monitor'}</span>
        {reason && !isNone && <div className="mt-0.5 text-[10px] text-[#666]">{reason}</div>}
      </div>
    </div>
  );
}

function ActionDetail({ category, action, reason, impact, color }: { category: string; action?: string; reason?: string; impact: number; color: string }) {
  const isNone = !action || action === 'Monitor' || action === 'No Action';
  return (
    <div className="rounded border border-[#222] bg-[#111] p-3">
      <div className="mb-1.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color }}>{category}</span>
          <span className={`text-[12px] font-medium ${isNone ? 'text-[#555]' : 'text-white'}`}>{action || 'No action'}</span>
        </div>
        {impact > 0 && <span className="text-[10px] text-green-400">+{formatCompact(impact)} clicks/mo</span>}
      </div>
      {reason && !isNone && <p className="text-[11px] leading-relaxed text-[#888]">{reason}</p>}
    </div>
  );
}

function num(v: any): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function formatCompact(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return n.toLocaleString();
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
}

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${Math.round(seconds)}s`;
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

function formatAge(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) return '—';
    const days = Math.floor((Date.now() - d.getTime()) / 86400000);
    if (days < 7) return 'Fresh (this week)';
    if (days < 30) return `Fresh (${Math.round(days / 7)}w ago)`;
    if (days < 180) return `Fresh (${Math.round(days / 30)}mo ago)`;
    if (days < 365) return `Aging (${Math.round(days / 30)}mo ago)`;
    if (days < 730) return `Stale (${Math.round(days / 365)}yr ago)`;
    return `Ancient (${Math.round(days / 365)}yr ago)`;
  } catch {
    return '—';
  }
}

function formatCat(cat: string): string {
  const map: Record<string, string> = {
    product: 'Product',
    blog_post: 'Blog',
    category: 'Category',
    landing_page: 'Landing',
    service_page: 'Service',
    homepage: 'Home',
    about_legal: 'About',
    faq_help: 'FAQ',
    resource: 'Resource',
    login_account: 'Login',
    pagination: 'Pagination',
    media: 'Media',
    other: 'Other',
  };
  return map[cat] || cat || 'Other';
}

function tryPath(url: string): string {
  try {
    return new URL(url).pathname;
  } catch {
    return url;
  }
}
