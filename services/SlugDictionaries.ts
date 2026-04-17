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
  'contatti', 'iletisim', 'connectez-nous', 'nous-contacter', 'contactez-nous', 'contactez', 'связаться', 'контакт', 'contato',
  'اتصل', 'اتصل-بنا', 'επικοινωνία', 'お問い合わせ', '문의', '联系', '联系เรา', 'संपर्क', 'ติดต่อ',
  'звязатися', 'контакти',
];

export const ABOUT_SLUGS = [
  'about', 'about-us', 'team', 'our-team', 'company', 'mission', 'story',
  'uber-uns', 'ueber-uns', 'o-nama', 'o-nas', 'a-propos', 'apropos', 'chi-siamo',
  'acerca-de', 'quienes-somos', 'sobre-nosotros', 'hakkimizda', 'wer-wir-sind',
  'om-os', 'over-ons', 'о-нас', 'о-компании', 'про-нас', 'про-компанію', 'περί-εμάς', 'σχετικά',
  '会社概要', '会社案内', 'について', '관에서', '회사소개', '关于', '关于我们',
  'हमारे-बारे-में', 'เกี่ยวกับ-เรา', 'من-نحن',
];

export const LEGAL_SLUGS = [
  'privacy', 'privacy-policy', 'terms', 'terms-of-service', 'terms-of-use',
  'legal', 'disclaimer', 'cookie', 'cookies', 'gdpr', 'imprint', 'impressum',
  'datenschutz', 'agb', 'nutzungsbedingungen', 'politica-de-privacidad',
  'aviso-legal', 'politique-de-confidentialite', 'mentions-legales',
  'privatnost', 'pravila-koriscenja', 'informativa', 'cookie-policy',
  'uvjeti-koristenja', 'политика-конфиденциальности', 'условия-использования', 'правовая-информация',
  'політика-конфіденційності', 'όροι-χρήσης', 'απορρήτου',
  'プライバシーポリシー', '利用規約', '이용약관', '개인정보처리방침',
  '隐私政策', '使用条款', 'सेवा-की-शर्तें', 'นโยบาย-ความเป็นส่วนตัว',
  'سياسة-الخصوصية', 'الشروط-والأحكام',
];

export const BLOG_SLUGS = [
  'blog', 'blogs', 'articles', 'article', 'news', 'novosti', 'vijesti',
  'aktuelles', 'nachrichten', 'noticias', 'actualites', 'actualite',
  'magazine', 'magazin', 'journal', 'post', 'posts', 'story', 'stories',
  'press', 'press-release', 'newsroom', 'media', 'blog-post', 'blog', 'статьи', 'новости', 'статті', 'νέα', 'άρθρα',
  'ニュース', '記事', 'ブログ', '뉴스', '기사', '블로그',
  '新闻', '文章', '博客', 'समाचार', 'लेख', 'ข่าว', 'บทความ',
  'مدونة', 'أخبار', 'مقالات',
];

export const CATEGORY_SLUGS = [
  'category', 'categories', 'kategorija', 'kategorije', 'kategorie',
  'categoria', 'categorias', 'categorie', 'kategori', 'rubrique', 'rubriques',
  'topic', 'topics', 'tema', 'theme', 'tag', 'tags', 'label', 'labels',
  'section', 'sections', 'sujet', 'sujets', 'thema', 'temat', 'категория', 'категории', 'категорія', 'категорії', 'κατηγορία', 'κατηγορίες',
  'カテゴリー', '카테고리', '分类', 'श्रेणी', 'หมวดหมู่', 'فئة', 'تصنيف',
];

export const PRODUCT_SLUGS = [
  'product', 'products', 'proizvod', 'proizvodi', 'produkt', 'produkte',
  'produkty', 'producto', 'productos', 'produit', 'produits', 'prodotto',
  'prodotti', 'urun', 'urunler', 'shop', 'store', 'trgovina', 'tienda',
  'boutique', 'negozio', 'magazin', 'товар', 'товары', 'продукти', 'προϊόν', 'προϊόντα',
  '製品', '商品', '제품', '상품', '产品', 'उत्पाद', 'สินค้า', 'منتج', 'منتجات',
];

export const LOCATION_SLUGS = [
  'location', 'locations', 'lokacija', 'lokacije', 'standort', 'standorte',
  'ubicacion', 'ubicaciones', 'emplacement', 'emplacements', 'sede', 'sedi',
  'adres', 'directions', 'find-us', 'office', 'offices', 'branch',
  'branches', 'store-locator', 'service-area', 'service-areas',
  'areas-we-serve', 'where-we-work', 'reach-us', 'standorte', 'адрес', 'адреса', 'μας-βρίσκετε', 'κατάστημα', 'καταστήματα',
  '店舗', '拠点', '매장', '지점', '门店', '分店', 'स्थान', 'สาขา', 'ที่ตั้ง',
  'فروع', 'موقع', 'مواقع',
];

export const PAGINATION_SLUGS = [
  'page', 'pagina', 'stranica', 'seite', 'pagina', 'pagine', 'sayfa',
];

export const SEARCH_SLUGS = [
  'search', 'suche', 'pretraga', 'busqueda', 'buscar', 'recherche',
  'cerca', 'ricerca', 'arama', 'szukaj', 'wyszukiwanie', 'поиск', 'пошук', 'αναζήτηση', '検索', '검색', '搜索', 'खोज', 'ค้นหา', 'بحث',
];

export const LOGIN_SLUGS = [
  'login', 'signin', 'sign-in', 'account', 'dashboard', 'admin', 'register',
  'signup', 'sign-up', 'auth', 'prijava', 'registracija', 'anmelden',
  'anmeldung', 'registrieren', 'connexion', 'inscription', 'giris', 'kayit', 'вход', 'войти', 'увійти', 'σύνδεση', 'ログイン', '로그인', '登录', 'لاگ-इन', 'เข้าสู่ระบบ', 'تسجيل-الدخول',
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
