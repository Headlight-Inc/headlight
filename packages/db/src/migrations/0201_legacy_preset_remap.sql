-- packages/db/src/migrations/0201_legacy_preset_remap.sql
-- Rewrite stored CustomAuditPreset.modes and industry to canonical ids.

-- 5a. Modes JSON array: replace each legacy id with its canonical mapping.
UPDATE crawl_audit_presets
SET modes_json = REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(
	modes_json,
	'"full"',                '"fullAudit"'),
	'"website_quality"',     '"wqa"'),
	'"technical_seo"',       '"technical"'),
	'"on_page_seo"',         '"wqa"'),
	'"off_page"',            '"linksAuthority"'),
	'"local_seo"',           '"local"'),
	'"ecommerce"',           '"commerce"'),
	'"news_editorial"',      '"content"'),
	'"ai_discoverability"',  '"ai"'),
	'"competitor_gap"',      '"competitors"'),
	'"business"',            '"wqa"'),
	'"accessibility"',       '"wqa"'),
	'"security"',            '"technical"');

-- 5b. Industry: snake_case to camelCase.
UPDATE crawl_audit_presets
SET industry = CASE industry
	WHEN 'real_estate' THEN 'realEstate'
	WHEN 'job_board'   THEN 'jobBoard'
	ELSE industry
END;
