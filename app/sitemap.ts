import { MetadataRoute } from 'next'
import { FEELINGS } from '@/lib/feelings-data'
import { NOINDEX_PATHS } from '@/lib/seo-noindex'

export const dynamic = 'force-static'

// Every public, indexable page. Add a page here when you create it; account
// pages (wallet, sessions, dashboard…) and /become-listener stay out.
const PAGES: [path: string, priority: number, freq: MetadataRoute.Sitemap[number]['changeFrequency']][] = [
  ['/',                                              1.0,  'weekly'],
  ['/talk',                                          1.0,  'weekly'],
  ['/browse',                                        0.95, 'hourly'],
  ['/how-it-works',                                  0.9,  'monthly'],
  ['/pricing',                                       0.9,  'monthly'],
  ['/faq',                                           0.8,  'monthly'],
  ['/trust',                                         0.8,  'monthly'],
  ['/safeguarding',                                  0.8,  'monthly'],
  ['/about',                                         0.7,  'monthly'],
  ['/peer-support',                                  0.8,  'monthly'],
  ['/peer-support-vs-therapy',                       0.8,  'monthly'],
  ['/talk-to-a-real-person-online',                  0.85, 'monthly'],
  ['/someone-to-talk-to-when-lonely',                0.85, 'monthly'],
  ['/need-someone-to-talk-to-but-dont-need-therapy', 0.85, 'monthly'],
  ['/talk-to-human-instead-of-chatgpt',              0.85, 'monthly'],
  ['/talk-to-someone-after-relationship-fight',      0.85, 'monthly'],
  ['/daily-check-in',                                0.7,  'weekly'],
  ['/become-a-peer-supporter',                       0.6,  'monthly'],
  ['/howwasyourday-is-not-a-job',                    0.4,  'yearly'],
  ['/contact',                                       0.5,  'yearly'],
  ['/privacy',                                       0.3,  'yearly'],
  ['/terms',                                         0.3,  'yearly'],
  ['/cookies',                                       0.3,  'yearly'],
]

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://www.howwasyourday.live'
  // force-static: evaluated at build time, i.e. the deploy date.
  const built = new Date()
  return [
    ...PAGES.filter(([p]) => !NOINDEX_PATHS.has(p)).map(([p, priority, changeFrequency]) => ({
      url: p === '/' ? base : `${base}${p}`, lastModified: built, changeFrequency, priority,
    })),
    ...FEELINGS.map(f => ({
      url: `${base}/feeling/${f.slug}`, lastModified: built, changeFrequency: 'monthly' as const, priority: 0.6,
    })),
  ]
}
