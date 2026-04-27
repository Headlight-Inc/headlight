-- packages/db/src/migrations/0200_data_layer_consolidation.sql
-- Lands the consolidated data layer. Additive only.

-- Denormalize fingerprint primaries onto crawl_pages and crawl_sites for fast filtering.
ALTER TABLE crawl_pages ADD COLUMN fp_industry TEXT;
ALTER TABLE crawl_pages ADD COLUMN fp_language TEXT;
ALTER TABLE crawl_pages ADD COLUMN fp_cms      TEXT;

ALTER TABLE crawl_sites ADD COLUMN fp_industry TEXT;
ALTER TABLE crawl_sites ADD COLUMN fp_language TEXT;
ALTER TABLE crawl_sites ADD COLUMN fp_cms      TEXT;
ALTER TABLE crawl_sites ADD COLUMN fp_geo      TEXT;
ALTER TABLE crawl_sites ADD COLUMN fp_intent   TEXT;

CREATE INDEX IF NOT EXISTS idx_crawl_pages_fp_industry ON crawl_pages(fp_industry);
CREATE INDEX IF NOT EXISTS idx_crawl_pages_fp_language ON crawl_pages(fp_language);
CREATE INDEX IF NOT EXISTS idx_crawl_sites_fp_industry ON crawl_sites(fp_industry);

-- Invalidate metric_catalog_cache: bumping schema_version forces a rebuild on next boot.
DELETE FROM metric_catalog_cache;
UPDATE schema_version SET value = '0200', updated_at = CURRENT_TIMESTAMP WHERE key = 'current';
INSERT INTO schema_version (key, value, updated_at)
	SELECT 'current', '0200', CURRENT_TIMESTAMP
	WHERE NOT EXISTS (SELECT 1 FROM schema_version WHERE key = 'current');
