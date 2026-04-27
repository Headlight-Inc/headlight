-- packages/db/src/migrations/0201_legacy_preset_remap.sql
-- Rewrite stored CustomAuditPreset.modes and industry to canonical ids.

-- 5a. Modes JSON array: replace each legacy id with its canonical mapping.
UPDATE crawl_audit_presets
SET modes_json = REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(
	modes_json,
	'"fullAudit"',                '"fullAudit"'),
	'"wqa"',     '"wqa"'),
	'"technical"',       '"technical"'),
	'"wqa"',         '"wqa"'),
	'"linksAuthority"',            '"linksAuthority"'),
	'"local"',           '"local"'),
	'"ecommerce"',           '"commerce"'),
	'"content"',      '"content"'),
	'"ai"',  '"ai"'),
	'"competitors"',      '"competitors"'),
	'"wqa"',            '"wqa"'),
	'"technical"',       '"wqa"'),
	'"technical"',            '"technical"');

-- 5b. Industry: snake_case to camelCase.
UPDATE crawl_audit_presets
SET industry = CASE industry
	WHEN 'realEstate' THEN 'realEstate'
	WHEN 'jobBoard'   THEN 'jobBoard'
	ELSE industry
END;
