// English and Hindi. English pages live at /…, Hindi at /hi/… (Astro i18n routing, see
// astro.config.mjs). Components read the language from the URL with `langOf(Astro)`.
import { TOPICS, TYPES, type ContentType, type Topic } from './site';

export const LANGS = ['en', 'hi'] as const;
export type Lang = (typeof LANGS)[number];

export const langOf = (astro: { currentLocale?: string }): Lang => (astro.currentLocale === 'hi' ? 'hi' : 'en');

// Site path for a language: localPath('hi', '/research/') → '/hi/research/'.
export const localPath = (lang: Lang, path: string) => (lang === 'hi' ? `/hi${path}` : path);

// The same page in the other language.
export const switchPath = (pathname: string, to: Lang) => {
  const bare = pathname.replace(/^\/hi(?=\/|$)/, '') || '/';
  return localPath(to, bare);
};

export const formatDate = (d: Date, lang: Lang) =>
  d.toLocaleDateString(lang === 'hi' ? 'hi-IN' : 'en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

export const formatNumber = (n: number, lang: Lang) => n.toLocaleString(lang === 'hi' ? 'en-IN' : 'en-GB');

const en = {
  langName: 'English',
  otherLang: 'हिन्दी',
  tagline: 'Research on the forces shaping the world.',
  description:
    'Independent research, case studies and financial reports on geopolitics, markets, war and the military, sports and technology.',
  nav: { research: 'Research', caseStudies: 'Case studies', reports: 'Reports', profile: 'Profile', signIn: 'Sign in', account: 'Account', search: 'Search' },
  skip: 'Skip to content',
  themeToggle: 'Switch light or dark theme',
  switchLang: 'Read this site in Hindi',
  home: {
    kicker: 'Research notebook · case studies · financial reports',
    hero: ['Research on the forces ', 'shaping', ' the world.'],
    cta: 'Read the research',
    cta2: 'Browse case studies',
    whatYouFind: 'What you’ll find',
    latest: 'Latest',
    everything: 'Everything →',
    firstPiece: 'The first piece is on its way.',
    topics: 'Topics',
    pieces: (n: number) => `${n} ${n === 1 ? 'piece' : 'pieces'}`,
  },
  list: {
    browse: 'Browse',
    archive: 'Archive',
    topic: 'Topic',
    everything: 'Everything',
    everythingBlurb: 'All research, case studies and financial reports, newest first.',
    empty: 'Nothing published here yet.',
    filter: 'Filter',
  },
  card: { updated: 'updated', inEnglish: 'In English' },
  piece: {
    minRead: (n: number) => `${n} min read`,
    updated: 'Updated',
    save: 'Save',
    saved: 'Saved',
    keepReading: 'Keep reading',
    onThisPage: 'On this page',
    references: 'References',
    updates: 'Updates',
    archived: 'Archived copy',
    accessed: 'Accessed',
    notes: 'Footnotes',
    backToText: 'Back to the text',
    note: 'Note',
    notTranslated: '',
    readOther: 'यह लेख हिन्दी में पढ़ें',
    moreOn: (topic: string) => `More on ${topic}`,
    browse: 'Browse',
    allOf: (what: string) => `All ${what.toLowerCase()}`,
  },
  chart: { source: 'Source', download: 'Download CSV', notebook: 'Notebook', numbers: 'Show the numbers' },
  map: { places: 'Places on this map', loading: 'Loading map…', source: 'Source', routes: 'Routes' },
  video: { play: 'Play video', watch: 'Watch' },
  gallery: { open: 'Open full size', broken: 'This image could not be loaded. Use an image address (ending .jpg/.png/.webp) or upload it to Media.' },
  profile: {
    kicker: 'Researcher profile',
    email: 'Email',
    about: 'About',
    workWithMe: 'Work with me',
    workText: 'Open to research collaborations, commissioned case studies and media appearances.',
    writeTo: 'Write to',
    background: 'Background',
    selected: 'Selected work',
  },
  footer: { topics: 'Topics', read: 'Read', profile: 'Researcher profile', rss: 'RSS feed', data: 'Data and notebooks' },
  search: {
    title: 'Search',
    kicker: 'Find',
    blurb: 'Every piece, searched by word, place or name.',
    placeholder: 'Search the ledger',
    devNote: 'Search is built with the site. Run "pnpm build" and "pnpm start" to try it; it is not available in dev.',
  },
  preview: {
    banner: 'Draft preview · updates by itself when the draft saves',
    updating: 'Updating…',
    refresh: 'Refresh',
    edit: 'Back to editor',
  },
  stamps: { data: 'Open data', updated: 'Updated' },
};

type Dict = typeof en;

const hi: Dict = {
  langName: 'हिन्दी',
  otherLang: 'English',
  tagline: 'दुनिया को आकार देने वाली ताक़तों पर शोध।',
  description: 'भू-राजनीति, बाज़ार, युद्ध और सेना, खेल और तकनीक पर स्वतंत्र शोध, केस स्टडी और वित्तीय रिपोर्ट।',
  nav: { research: 'शोध', caseStudies: 'केस स्टडी', reports: 'रिपोर्ट', profile: 'प्रोफ़ाइल', signIn: 'साइन इन', account: 'खाता', search: 'खोजें' },
  skip: 'सीधे सामग्री पर जाएँ',
  themeToggle: 'लाइट या डार्क थीम बदलें',
  switchLang: 'Read this site in English',
  home: {
    kicker: 'शोध नोटबुक · केस स्टडी · वित्तीय रिपोर्ट',
    hero: ['दुनिया को ', 'आकार', ' देने वाली ताक़तों पर शोध।'],
    cta: 'शोध पढ़ें',
    cta2: 'केस स्टडी देखें',
    whatYouFind: 'यहाँ क्या मिलेगा',
    latest: 'नया',
    everything: 'सब कुछ →',
    firstPiece: 'पहला लेख जल्द आ रहा है।',
    topics: 'विषय',
    pieces: (n: number) => `${n} लेख`,
  },
  list: {
    browse: 'देखें',
    archive: 'संग्रह',
    topic: 'विषय',
    everything: 'सब कुछ',
    everythingBlurb: 'सारे शोध, केस स्टडी और वित्तीय रिपोर्ट, नए से पुराने क्रम में।',
    empty: 'यहाँ अभी कुछ प्रकाशित नहीं हुआ है।',
    filter: 'छाँटें',
  },
  card: { updated: 'अपडेट', inEnglish: 'अंग्रेज़ी में' },
  piece: {
    minRead: (n: number) => `${n} मिनट`,
    updated: 'अपडेट किया गया',
    save: 'सहेजें',
    saved: 'सहेजा गया',
    keepReading: 'और पढ़ें',
    onThisPage: 'इस पेज पर',
    references: 'संदर्भ',
    updates: 'अपडेट',
    archived: 'संग्रहीत प्रति',
    accessed: 'देखा गया',
    notes: 'फ़ुटनोट',
    backToText: 'पाठ पर लौटें',
    note: 'टिप्पणी',
    notTranslated: 'यह लेख अभी हिन्दी में उपलब्ध नहीं है, इसलिए नीचे अंग्रेज़ी संस्करण दिया गया है।',
    readOther: 'Read this piece in English',
    moreOn: (topic: string) => `${topic} पर और`,
    browse: 'और देखें',
    allOf: (what: string) => `सभी: ${what}`,
  },
  chart: { source: 'स्रोत', download: 'CSV डाउनलोड करें', notebook: 'नोटबुक', numbers: 'आँकड़े देखें' },
  map: { places: 'इस नक़्शे पर जगहें', loading: 'नक़्शा लोड हो रहा है…', source: 'स्रोत', routes: 'रास्ते' },
  video: { play: 'वीडियो चलाएँ', watch: 'देखें' },
  gallery: { open: 'पूरे आकार में खोलें', broken: 'यह तस्वीर लोड नहीं हो सकी। तस्वीर का सीधा पता (.jpg/.png/.webp) दें या उसे मीडिया में अपलोड करें।' },
  profile: {
    kicker: 'शोधकर्ता प्रोफ़ाइल',
    email: 'ईमेल',
    about: 'परिचय',
    workWithMe: 'साथ काम करें',
    workText: 'शोध सहयोग, कमीशन की गई केस स्टडी और मीडिया में भागीदारी के लिए उपलब्ध।',
    writeTo: 'लिखें:',
    background: 'पृष्ठभूमि',
    selected: 'चुनिंदा काम',
  },
  footer: { topics: 'विषय', read: 'पढ़ें', profile: 'शोधकर्ता प्रोफ़ाइल', rss: 'RSS फ़ीड', data: 'डेटा और नोटबुक' },
  search: {
    title: 'खोजें',
    kicker: 'खोज',
    blurb: 'किसी भी शब्द, जगह या नाम से सारे लेख खोजें।',
    placeholder: 'यहाँ खोजें',
    devNote: 'खोज साइट के बिल्ड के साथ बनती है। आज़माने के लिए "pnpm build" और "pnpm start" चलाएँ; dev में यह उपलब्ध नहीं है।',
  },
  preview: {
    banner: 'ड्राफ़्ट प्रीव्यू · ड्राफ़्ट सेव होते ही अपने आप अपडेट होता है',
    updating: 'अपडेट हो रहा है…',
    refresh: 'रीफ़्रेश',
    edit: 'एडिटर पर लौटें',
  },
  stamps: { data: 'ओपन डेटा', updated: 'अपडेट' },
};

export const ui: Record<Lang, Dict> = { en, hi };
export const t = (lang: Lang) => ui[lang];

const TOPICS_HI: Record<Topic, { label: string; blurb: string }> = {
  geopolitics: { label: 'भू-राजनीति', blurb: 'विश्व मामले और घटनाएँ: देश, गठबंधन, चुनाव और सीमाएँ।' },
  finance: { label: 'वित्त और बाज़ार', blurb: 'कंपनियों के नतीजे, वित्तीय रिपोर्ट, अर्थव्यवस्था और बाज़ार।' },
  'war-military': { label: 'युद्ध और सेना', blurb: 'संघर्ष, सशस्त्र बल, रणनीति और रक्षा तकनीक।' },
  sports: { label: 'खेल', blurb: 'खेल के पीछे का कारोबार, आयोजन और आँकड़े।' },
  tech: { label: 'तकनीक', blurb: 'तकनीक, कंपनियाँ और उनसे जुड़ी नीतियाँ।' },
};

const TYPES_HI: Record<ContentType, { label: string; plural: string; blurb: string }> = {
  research: { label: 'शोध', plural: 'शोध', blurb: 'एक सवाल पर गहराई से लिखे लेख, चार्ट और संदर्भों के साथ।' },
  'case-study': { label: 'केस स्टडी', plural: 'केस स्टडी', blurb: 'एक घटना, कंपनी या अभियान की शुरू से अंत तक पड़ताल।' },
  report: { label: 'वित्तीय रिपोर्ट', plural: 'वित्तीय रिपोर्ट', blurb: 'नतीजे, फ़ाइलिंग और आँकड़े, आसान भाषा में समझाए गए।' },
};

export const topicInfo = (lang: Lang, k: Topic) => ({
  ...TOPICS[k],
  ...(lang === 'hi' ? TOPICS_HI[k] : {}),
  href: localPath(lang, `/topics/${k}/`),
});

export const typeInfo = (lang: Lang, k: ContentType) => ({
  ...TYPES[k],
  ...(lang === 'hi' ? TYPES_HI[k] : {}),
  href: localPath(lang, TYPES[k].href),
});
