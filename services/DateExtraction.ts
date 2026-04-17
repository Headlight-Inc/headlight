/**
 * DateExtraction.ts
 *
 * Extracts a visible publication/modified date from raw HTML + text.
 * Returns ISO-8601 (YYYY-MM-DD) or null.
 *
 * Layered approach:
 *   1. <time datetime="…">
 *   2. <meta property="article:published_time" | "article:modified_time" | "og:updated_time">
 *   3. JSON-LD datePublished / dateModified
 *   4. Visible body text — multilingual regex + localized month dictionaries
 *
 * Called from server/crawlerWorker.js to populate `visibleDate`.
 */

type ExtractInput = {
  html: string;
  textContent: string;
  $?: any; // optional cheerio instance (when called from crawlerWorker)
};

const MONTHS: Record<string, Record<string, number>> = {
  en: {
    january: 1, jan: 1, february: 2, feb: 2, march: 3, mar: 3,
    april: 4, apr: 4, may: 5, june: 6, jun: 6, july: 7, jul: 7,
    august: 8, aug: 8, september: 9, sep: 9, sept: 9,
    october: 10, oct: 10, november: 11, nov: 11, december: 12, dec: 12,
  },
  bs: { // shared with hr, sr
    januar: 1, siječanj: 1, januara: 1, siječnja: 1,
    februar: 2, veljača: 2, februara: 2, veljače: 2,
    mart: 3, ožujak: 3, marta: 3, ožujka: 3,
    april: 4, travanj: 4, aprila: 4, travnja: 4,
    maj: 5, svibanj: 5, maja: 5, svibnja: 5,
    juni: 6, lipanj: 6, juna: 6, lipnja: 6,
    juli: 7, srpanj: 7, jula: 7, srpnja: 7,
    august: 8, kolovoz: 8, avgusta: 8, kolovoza: 8,
    septembar: 9, rujan: 9, septembra: 9, rujna: 9,
    oktobar: 10, listopad: 10, oktobra: 10, listopada: 10,
    novembar: 11, studeni: 11, novembra: 11, studenog: 11,
    decembar: 12, prosinac: 12, decembra: 12, prosinca: 12,
  },
  de: {
    januar: 1, jan: 1, februar: 2, feb: 2, märz: 3, maerz: 3, mär: 3,
    april: 4, apr: 4, mai: 5, juni: 6, jun: 6, juli: 7, jul: 7,
    august: 8, aug: 8, september: 9, sep: 9, sept: 9,
    oktober: 10, okt: 10, november: 11, nov: 11, dezember: 12, dez: 12,
  },
  fr: {
    janvier: 1, 'janv.': 1, janv: 1, février: 2, fevrier: 2, 'févr.': 2, fevr: 2,
    mars: 3, avril: 4, 'avr.': 4, avr: 4, mai: 5, juin: 6, juillet: 7, 'juil.': 7, juil: 7,
    août: 8, aout: 8, septembre: 9, 'sept.': 9, sept: 9,
    octobre: 10, 'oct.': 10, oct: 10, novembre: 11, 'nov.': 11, nov: 11,
    décembre: 12, decembre: 12, 'déc.': 12, dec: 12,
  },
  es: {
    enero: 1, febrero: 2, marzo: 3, abril: 4, mayo: 5, junio: 6,
    julio: 7, agosto: 8, settembre: 9, setiembre: 9,
    octubre: 10, november: 11, diciembre: 12,
  },
  it: {
    gennaio: 1, febbraio: 2, marzo: 3, aprile: 4, maggio: 5, giugno: 6,
    luglio: 7, agosto: 8, settembre: 9, ottobre: 10, novembre: 11, dicembre: 12,
  },
  pt: {
    janeiro: 1, fevereiro: 2, março: 3, marco: 3, abril: 4, maio: 5, junho: 6,
    julho: 7, agosto: 8, setembro: 9, outubro: 10, novembre: 11, dezembro: 12,
  },
  tr: {
    ocak: 1, şubat: 2, subat: 2, mart: 3, nisan: 4, mayıs: 5, mayis: 5,
    haziran: 6, temmuz: 7, ağustos: 8, agustos: 8,
    eylül: 9, eylul: 9, ekim: 10, kasım: 11, kasim: 11, aralık: 12, aralik: 12,
  },
  ru: {
    января: 1, февраля: 2, марта: 3, апреля: 4, мая: 5, июня: 6,
    июля: 7, августа: 8, сентября: 9, октября: 10, ноября: 11, декабря: 12,
  },
  pl: {
    styczeń: 1, stycznia: 1, luty: 2, lutego: 2, marzec: 3, marca: 3,
    kwiecień: 4, kwietnia: 4, maj: 5, maja: 5, czerwiec: 6, czerwca: 6,
    lipiec: 7, lipca: 7, sierpień: 8, sierpnia: 8, wrzesień: 9, września: 9,
    październik: 10, października: 10, listopad: 11, listopada: 11, grudzień: 12, grudnia: 12,
  },
};

export function extractVisibleDate(input: ExtractInput): string | null {
  const { html, textContent, $ } = input;

  // 1. <time datetime>
  if ($) {
    const t = $('time[datetime]').attr('datetime');
    const iso = toIso(t);
    if (iso) return iso;
  } else {
    const m = /<time[^>]*datetime=["']([^"']+)["']/i.exec(html);
    if (m) { const iso = toIso(m[1]); if (iso) return iso; }
  }

  // 2. meta tags
  const metaKeys = [
    'article:published_time',
    'article:modified_time',
    'og:updated_time',
    'dc.date',
    'dc.date.issued',
  ];
  for (const key of metaKeys) {
    const re = new RegExp(`<meta[^>]*property=["']${key}["'][^>]*content=["']([^"']+)["']`, 'i');
    const m = re.exec(html);
    if (m) { const iso = toIso(m[1]); if (iso) return iso; }
    const re2 = new RegExp(`<meta[^>]*name=["']${key}["'][^>]*content=["']([^"']+)["']`, 'i');
    const m2 = re2.exec(html);
    if (m2) { const iso = toIso(m2[1]); if (iso) return iso; }
  }

  // 3. JSON-LD datePublished
  const ldMatches = html.matchAll(/<script[^>]*application\/ld\+json[^>]*>([\s\S]*?)<\/script>/gi);
  for (const match of ldMatches) {
    try {
      const parsed = JSON.parse(match[1].trim());
      const candidates = Array.isArray(parsed) ? parsed : [parsed];
      for (const c of candidates) {
        const d = c?.datePublished || c?.dateModified || c?.uploadDate;
        const iso = toIso(d);
        if (iso) return iso;
      }
    } catch { /* malformed JSON-LD, skip */ }
  }

  // 4. Visible body text — numeric patterns first (language-agnostic)
  const numericIso = matchNumericDate(textContent);
  if (numericIso) return numericIso;

  // 5. Multilingual month names
  const monthIso = matchMonthNameDate(textContent);
  if (monthIso) return monthIso;

  // 6. CJK patterns YYYY年MM月DD日
  const cjk = /(\d{4})\s*年\s*(\d{1,2})\s*月\s*(\d{1,2})\s*日/.exec(textContent);
  if (cjk) return pad(cjk[1], cjk[2], cjk[3]);

  return null;
}

function toIso(value: string | undefined | null): string | null {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString().split('T')[0];
}

function matchNumericDate(text: string): string | null {
  // Order: ISO, ISO-like, dd.mm.yyyy, dd/mm/yyyy, dd-mm-yyyy, mm/dd/yyyy (US)
  const patterns: Array<[RegExp, (m: RegExpExecArray) => string | null]> = [
    [/\b(\d{4})-(\d{2})-(\d{2})\b/, m => pad(m[1], m[2], m[3])],
    [/\b(\d{1,2})\.(\d{1,2})\.(\d{4})\.?\b/, m => pad(m[3], m[2], m[1])], // BS/DE
    [/\b(\d{1,2})\/(\d{1,2})\/(\d{4})\b/, m => {
      // Ambiguous US vs EU. Prefer EU if day > 12.
      const a = Number(m[1]), b = Number(m[2]);
      if (a > 12) return pad(m[3], m[2], m[1]);
      if (b > 12) return pad(m[3], m[1], m[2]);
      return pad(m[3], m[1], m[2]); // default US when both ≤ 12
    }],
    [/\b(\d{1,2})-(\d{1,2})-(\d{4})\b/, m => pad(m[3], m[2], m[1])],
  ];
  for (const [re, fn] of patterns) {
    const m = re.exec(text);
    if (m) { const iso = fn(m); if (iso) return iso; }
  }
  return null;
}

function matchMonthNameDate(text: string): string | null {
  const sample = text.slice(0, 4000).toLowerCase(); // guard against huge docs
  for (const lang of Object.keys(MONTHS)) {
    const dict = MONTHS[lang];
    const months = Object.keys(dict).sort((a, b) => b.length - a.length); // longest first
    for (const name of months) {
      // Order 1: "15. travnja 2026" / "15 de enero de 2025" / "15 janvier 2025"
      const rx1 = new RegExp(`\\b(\\d{1,2})[\\.\\s,]+(?:de\\s+)?${escapeRegex(name)}[\\.\\s,]*(?:de\\s+|del\\s+)?(\\d{4})\\b`, 'i');
      const m1 = rx1.exec(sample);
      if (m1) return pad(m1[2], String(dict[name]), m1[1]);
      // Order 2: "January 15, 2025" / "Janvier 2025"
      const rx2 = new RegExp(`\\b${escapeRegex(name)}[\\.\\s,]+(\\d{1,2})(?:st|nd|rd|th)?[\\.\\s,]+(\\d{4})\\b`, 'i');
      const m2 = rx2.exec(sample);
      if (m2) return pad(m2[2], String(dict[name]), m2[1]);
    }
  }
  return null;
}

function pad(y: string, m: string, d: string): string | null {
  const yy = Number(y), mm = Number(m), dd = Number(d);
  if (!yy || !mm || !dd) return null;
  if (yy < 1990 || yy > 2100) return null;
  if (mm < 1 || mm > 12) return null;
  if (dd < 1 || dd > 31) return null;
  return `${yy}-${String(mm).padStart(2, '0')}-${String(dd).padStart(2, '0')}`;
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
