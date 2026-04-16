/**
 * SlugDictionaries.ts
 *
 * Language-agnostic URL slug patterns for category detection.
 * Covers: English, German, Bosnian/Serbian/Croatian, Spanish, French,
 *         Italian, Turkish, Portuguese, Polish, Czech, Dutch.
 * Each entry is matched against the path as a whole-segment regex.
 */

const joinSlugs = (slugs: string[]) =>
  new RegExp(`(^|/)(${slugs.join('|')})(/|$|\\-|\\?)`, 'i');

export const CONTACT_SLUGS = [
  'contact', 'contact-us', 'kontakt', 'kontakty', 'contato', 'contacto',
  'contatti', 'iletisim', 'connectez-nous', 'nous-contacter', 'contactez-nous',
];

export const ABOUT_SLUGS = [
  'about', 'about-us', 'team', 'our-team', 'company', 'mission', 'story',
  'uber-uns', 'ueber-uns', 'o-nama', 'o-nas', 'a-propos', 'apropos', 'chi-siamo',
  'acerca-de', 'quienes-somos', 'sobre-nosotros', 'hakkimizda', 'wer-wir-sind',
  'om-os', 'over-ons',
];

export const LEGAL_SLUGS = [
  'privacy', 'privacy-policy', 'terms', 'terms-of-service', 'terms-of-use',
  'legal', 'disclaimer', 'cookie', 'cookies', 'gdpr', 'imprint', 'impressum',
  'datenschutz', 'agb', 'nutzungsbedingungen', 'politica-de-privacidad',
  'aviso-legal', 'politique-de-confidentialite', 'mentions-legales',
  'privatnost', 'pravila-koriscenja', 'informativa', 'cookie-policy',
  'uvjeti-koristenja',
];

export const BLOG_SLUGS = [
  'blog', 'blogs', 'articles', 'article', 'news', 'novosti', 'vijesti',
  'aktuelles', 'nachrichten', 'noticias', 'actualites', 'actualite',
  'magazine', 'magazin', 'journal', 'post', 'posts', 'story', 'stories',
  'press', 'press-release', 'newsroom', 'media', 'blog-post',
];

export const CATEGORY_SLUGS = [
  'category', 'categories', 'kategorija', 'kategorije', 'kategorie',
  'categoria', 'categorias', 'categorie', 'kategori', 'rubrique', 'rubriques',
  'topic', 'topics', 'tema', 'theme', 'tag', 'tags', 'label', 'labels',
  'section', 'sections', 'sujet', 'sujets', 'thema', 'temat',
];

export const PRODUCT_SLUGS = [
  'product', 'products', 'proizvod', 'proizvodi', 'produkt', 'produkte',
  'produkty', 'producto', 'productos', 'produit', 'produits', 'prodotto',
  'prodotti', 'urun', 'urunler', 'shop', 'store', 'trgovina', 'tienda',
  'boutique', 'negozio', 'magazin',
];

export const LOCATION_SLUGS = [
  'location', 'locations', 'lokacija', 'lokacije', 'standort', 'standorte',
  'ubicacion', 'ubicaciones', 'emplacement', 'emplacements', 'sede', 'sedi',
  'adres', 'directions', 'find-us', 'office', 'offices', 'branch',
  'branches', 'store-locator', 'service-area', 'service-areas',
  'areas-we-serve', 'where-we-work', 'reach-us', 'standorte',
];

export const PAGINATION_SLUGS = [
  'page', 'pagina', 'stranica', 'seite', 'pagina', 'pagine', 'sayfa',
];

export const SEARCH_SLUGS = [
  'search', 'suche', 'pretraga', 'busqueda', 'buscar', 'recherche',
  'cerca', 'ricerca', 'arama', 'szukaj', 'wyszukiwanie',
];

export const LOGIN_SLUGS = [
  'login', 'signin', 'sign-in', 'account', 'dashboard', 'admin', 'register',
  'signup', 'sign-up', 'auth', 'prijava', 'registracija', 'anmelden',
  'anmeldung', 'registrieren', 'connexion', 'inscription', 'giris', 'kayit',
];

// ─── Pre-built matchers ───

export const RX_CONTACT = joinSlugs(CONTACT_SLUGS);
export const RX_ABOUT = joinSlugs(ABOUT_SLUGS);
export const RX_LEGAL = joinSlugs(LEGAL_SLUGS);
export const RX_BLOG = joinSlugs(BLOG_SLUGS);
export const RX_CATEGORY = joinSlugs(CATEGORY_SLUGS);
export const RX_PRODUCT = joinSlugs(PRODUCT_SLUGS);
export const RX_LOCATION = joinSlugs(LOCATION_SLUGS);
export const RX_PAGINATION = joinSlugs(PAGINATION_SLUGS);
export const RX_SEARCH = joinSlugs(SEARCH_SLUGS);
export const RX_LOGIN = joinSlugs(LOGIN_SLUGS);

export function hasLocationSlug(pathname: string): boolean {
  return RX_LOCATION.test(pathname.toLowerCase());
}
export function hasProductSlug(pathname: string): boolean {
  return RX_PRODUCT.test(pathname.toLowerCase());
}
export function hasBlogSlug(pathname: string): boolean {
  return RX_BLOG.test(pathname.toLowerCase());
}
export function hasCategorySlug(pathname: string): boolean {
  return RX_CATEGORY.test(pathname.toLowerCase());
}
