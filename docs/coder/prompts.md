# AI Prompt Inventory

This document tracks the core AI prompts used for site fingerprinting and page analysis. All prompts are implemented using the `Prompt<In, Out>` interface in `packages/ai/src/prompts/`.

## 1. Industry Classification
- **ID**: `fingerprint.industry.classify`
- **Tier**: S (High Precision)
- **Task**: Classify a website into one of the core industries (ecommerce, saas, blog, etc.) based on sample pages, schemas, and CMS hints.
- **System Prompt**:
  > You classify a website by industry from at most 8 page samples.
  > Valid industries: ecommerce, saas, blog, news, finance, education, healthcare, local, jobBoard, realEstate, restaurant, portfolio, media, government, nonprofit, general.
  > Decide from path tokens, JSON-LD schema types, page titles, and the CMS hint. Use schema first, then path, then title text. Prefer specific ("restaurant", "jobBoard", "realEstate") over generic ("local", "general").

## 2. Intent Classification
- **ID**: `fingerprint.intent.classify`
- **Tier**: S
- **Task**: Identify the dominant search intent (commercial, informational, navigational, transactional) for the site and per template.
- **System Prompt**:
  > You classify the dominant search intent of a site from a few representative templates.
  > Valid intents: commercial (compare/research before buy), informational (learn/how-to), navigational (find specific entity), transactional (act now: buy/sign-up/book).
  > Give site-level primary and per-template intent.

## 3. CMS Disambiguation
- **ID**: `fingerprint.cms.disambiguate`
- **Tier**: S
- **Task**: Resolve ambiguity when multiple CMS candidates are detected (e.g., both Shopify and custom headers).
- **System Prompt**:
  > You break ties between CMS candidates for a website. Choose exactly one from the candidates list, using the html <head> contents and response headers as evidence.
  > Prefer header-based evidence (x-generator, x-shopify-stage, x-ghost-cache-status, x-magento-cache-debug) over body fingerprints. Look for unique asset paths (cdn.shopify.com, framerusercontent.com, static.wixstatic.com).

## 4. Language Fallback
- **ID**: `fingerprint.language.fallback`
- **Tier**: S
- **Task**: Identify the BCP-47 language of a text snippet when HTML `lang` attributes are missing or untrusted.
- **System Prompt**:
  > Identify the dominant language of a short text snippet. Return BCP-47 primary subtag only ("en", "es", "de", "ja", "bs", "hr", "sr", ...). If the text is mixed or you cannot decide, return null.

## 5. [MISSING] EEAT Scoring
- **ID**: `metric.content.eeat` (Placeholder)
- **Status**: Researching legacy code.
- **Goal**: Score Expertise, Authoritativeness, and Trustworthiness based on author bios, about pages, and citation patterns.

## 6. [MISSING] Quality/Helpfulness
- **ID**: `metric.content.quality` (Placeholder)
- **Status**: Researching legacy code.
- **Goal**: Determine if content is "Helpful" vs "SEO-first" based on depth, uniqueness, and formatting.

---
*Last Updated: 2026-04-27*
