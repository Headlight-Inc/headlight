// packages/types/src/cms.ts

export const CMS_KEYS = [
	'wordpress', 'woocommerce', 'shopify', 'wix', 'squarespace', 'hubspot-cms',
	'ghost', 'medium', 'substack', 'magento', 'webflow', 'framer',
	'drupal', 'joomla', 'bigcommerce', 'salesforce-commerce', 'bitrix', 'duda',
	'astro', 'jekyll', 'hugo', 'notion', 'contentful', 'sanity',
	'strapi', 'nextjs-headless', 'gatsby', 'intercom', 'custom',
] as const;

export type CmsKey = typeof CMS_KEYS[number];

export interface CmsDescriptor {
	id: CmsKey;
	label: string;
	vendorUrl?: string;
	capabilities: ReadonlyArray<
		| 'rest-api'             // CMS exposes a REST API we can probe at T2
		| 'graphql'              // CMS exposes a GraphQL endpoint
		| 'sitemap-index'        // sitemap is reliably split into an index
		| 'auto-amp'             // CMS auto-emits AMP pages
		| 'product-feed'         // exposes a structured product feed
		| 'review-schema'        // emits Review/AggregateRating natively
		| 'pretty-permalinks'    // never has /?p=123 style URLs
		| 'theme-fingerprint'    // theme markers are a reliable secondary signal
	>;
}

export const CMS_DESCRIPTORS: Record<CmsKey, CmsDescriptor> = {
	wordpress: { id: 'wordpress', label: 'WordPress', vendorUrl: 'https://wordpress.org', capabilities: ['rest-api', 'sitemap-index', 'pretty-permalinks', 'theme-fingerprint'] },
	woocommerce: { id: 'woocommerce', label: 'WooCommerce', vendorUrl: 'https://woocommerce.com', capabilities: ['rest-api', 'sitemap-index', 'product-feed', 'review-schema'] },
	shopify: { id: 'shopify', label: 'Shopify', vendorUrl: 'https://shopify.com', capabilities: ['rest-api', 'graphql', 'sitemap-index', 'product-feed', 'review-schema', 'pretty-permalinks'] },
	wix: { id: 'wix', label: 'Wix', vendorUrl: 'https://wix.com', capabilities: ['sitemap-index'] },
	squarespace: { id: 'squarespace', label: 'Squarespace', vendorUrl: 'https://squarespace.com', capabilities: ['sitemap-index'] },
	'hubspot-cms': { id: 'hubspot-cms', label: 'HubSpot CMS', vendorUrl: 'https://hubspot.com', capabilities: ['rest-api', 'sitemap-index'] },
	ghost: { id: 'ghost', label: 'Ghost', vendorUrl: 'https://ghost.org', capabilities: ['rest-api', 'sitemap-index', 'pretty-permalinks'] },
	medium: { id: 'medium', label: 'Medium', vendorUrl: 'https://medium.com', capabilities: [] },
	substack: { id: 'substack', label: 'Substack', vendorUrl: 'https://substack.com', capabilities: ['sitemap-index'] },
	magento: { id: 'magento', label: 'Magento', vendorUrl: 'https://magento.com', capabilities: ['rest-api', 'sitemap-index', 'product-feed', 'review-schema'] },
	webflow: { id: 'webflow', label: 'Webflow', vendorUrl: 'https://webflow.com', capabilities: ['sitemap-index', 'pretty-permalinks'] },
	framer: { id: 'framer', label: 'Framer', vendorUrl: 'https://framer.com', capabilities: ['pretty-permalinks'] },
	drupal: { id: 'drupal', label: 'Drupal', vendorUrl: 'https://drupal.org', capabilities: ['rest-api', 'sitemap-index', 'theme-fingerprint'] },
	joomla: { id: 'joomla', label: 'Joomla', vendorUrl: 'https://joomla.org', capabilities: ['sitemap-index', 'theme-fingerprint'] },
	bigcommerce: { id: 'bigcommerce', label: 'BigCommerce', vendorUrl: 'https://bigcommerce.com', capabilities: ['rest-api', 'graphql', 'sitemap-index', 'product-feed', 'review-schema'] },
	'salesforce-commerce': { id: 'salesforce-commerce', label: 'Salesforce Commerce', vendorUrl: 'https://salesforce.com', capabilities: ['rest-api', 'sitemap-index', 'product-feed'] },
	bitrix: { id: 'bitrix', label: 'Bitrix', vendorUrl: 'https://bitrix24.com', capabilities: ['sitemap-index'] },
	duda: { id: 'duda', label: 'Duda', vendorUrl: 'https://duda.co', capabilities: ['sitemap-index'] },
	astro: { id: 'astro', label: 'Astro', vendorUrl: 'https://astro.build', capabilities: ['pretty-permalinks'] },
	jekyll: { id: 'jekyll', label: 'Jekyll', vendorUrl: 'https://jekyllrb.com', capabilities: ['pretty-permalinks'] },
	hugo: { id: 'hugo', label: 'Hugo', vendorUrl: 'https://gohugo.io', capabilities: ['pretty-permalinks'] },
	notion: { id: 'notion', label: 'Notion', capabilities: [] },
	contentful: { id: 'contentful', label: 'Contentful', vendorUrl: 'https://contentful.com', capabilities: ['rest-api', 'graphql'] },
	sanity: { id: 'sanity', label: 'Sanity', vendorUrl: 'https://sanity.io', capabilities: ['graphql'] },
	strapi: { id: 'strapi', label: 'Strapi', vendorUrl: 'https://strapi.io', capabilities: ['rest-api', 'graphql'] },
	'nextjs-headless': { id: 'nextjs-headless', label: 'Next.js (headless)', vendorUrl: 'https://nextjs.org', capabilities: ['pretty-permalinks'] },
	gatsby: { id: 'gatsby', label: 'Gatsby', vendorUrl: 'https://gatsbyjs.com', capabilities: ['pretty-permalinks'] },
	intercom: { id: 'intercom', label: 'Intercom Articles', vendorUrl: 'https://intercom.com', capabilities: [] },
	custom: { id: 'custom', label: 'Custom / Unknown', capabilities: [] },
};

export function isCmsKey(value: unknown): value is CmsKey {
	return typeof value === 'string' && (CMS_KEYS as readonly string[]).includes(value);
}

export const CMS_LABELS: Record<CmsKey, string> = Object.fromEntries(
	Object.entries(CMS_DESCRIPTORS).map(([k, v]) => [k, v.label])
) as Record<CmsKey, string>;
