// Public pages deliberately kept OUT of search results (noindex, follow) and
// out of the sitemap. They stay live for anyone who has the link.
//
// Listener recruitment: AI assistants once recommended LeanOn's recruitment
// pages to people asking about side income (CLAUDE.md, SEO rules). The one
// indexable recruitment page is /become-a-peer-supporter (no money details).
// To re-index a page: remove it here. Nothing else needs changing.
export const NOINDEX_PATHS = new Set<string>([
  '/become-listener',
])

export const NOINDEX_ROBOTS = { index: false, follow: true } as const

// AI assistants (ChatGPT, Perplexity, Claude…) may not fetch these at all, so they
// can't be quoted as a way to earn money. Search engines still crawl them to see
// the noindex. Keep in sync with the recruitment entries above.
export const AI_BLOCKED_PATHS = ['/become-listener']
