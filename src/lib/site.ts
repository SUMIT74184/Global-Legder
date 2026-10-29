export const SITE = {
  name: 'The Global Ledger',
  tagline: 'Research on the forces shaping the world.',
  description:
    'Independent research, case studies and financial reports on geopolitics, markets, war and the military, sports and technology.',
  author: 'The Global Ledger', // TODO: your name
  youtube: '', // TODO: channel URL
  github: '', // TODO: notebooks repository URL
};

// Topics: what a piece is about. Add a key here and it gets a page, a filter chip and a home card.
export const TOPICS = {
  geopolitics: {
    label: 'Geopolitics',
    blurb: 'World affairs and events: states, alliances, elections and borders.',
    color: 'var(--clay)',
  },
  finance: {
    label: 'Finance & markets',
    blurb: 'Company results, financial reports, the economy and markets.',
    color: 'var(--gold)',
  },
  'war-military': {
    label: 'War & military',
    blurb: 'Conflicts, armed forces, strategy and defence technology.',
    color: 'var(--olive)',
  },
  sports: {
    label: 'Sports',
    blurb: 'The business, events and numbers behind sport.',
    color: 'var(--sky)',
  },
  tech: {
    label: 'Tech news',
    blurb: 'Technology, companies and the policy around them.',
    color: 'var(--heather)',
  },
} as const;

export type Topic = keyof typeof TOPICS;
export const TOPIC_KEYS = Object.keys(TOPICS) as Topic[];

// Types: what form a piece takes. Each has its own listing page.
export const TYPES = {
  research: { label: 'Research', plural: 'Research', href: '/research/', blurb: 'In-depth articles on one question, with charts and references.' },
  'case-study': { label: 'Case study', plural: 'Case studies', href: '/case-studies/', blurb: 'One event, company or campaign traced end to end.' },
  report: { label: 'Financial report', plural: 'Financial reports', href: '/reports/', blurb: 'Results, filings and numbers, broken down and explained.' },
} as const;

export type ContentType = keyof typeof TYPES;
export const TYPE_KEYS = Object.keys(TYPES) as ContentType[];
