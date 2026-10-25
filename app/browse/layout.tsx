import type { Metadata } from 'next'
import { DEFAULT_LISTENER_RATE, PLATFORM_FEE, SESSION_DURATIONS } from '@/lib/constants'

export const metadata: Metadata = {
  title: 'Browse Peer Listeners | How Was Your Day — Talk to a Real Person',
  description: 'Browse verified peer listeners in the UK. Filter by topic, availability, and language. Talk now or book a time — sessions from 8 minutes.',
  keywords: [
    'peer listener UK', 'talk to a real person online UK', 'online emotional support UK',
    'someone to talk to UK', 'peer support chat UK', 'talk to someone when lonely',
    'book a listener', 'talk to someone tonight', 'human listener online',
  ],
  alternates: { canonical: 'https://www.howwasyourday.live/browse', languages: { 'en-GB': 'https://www.howwasyourday.live/browse' } },
  openGraph: {
    title: 'Browse Peer Listeners | How Was Your Day — Talk to a Real Person',
    description: 'Browse verified peer listeners in the UK. Filter by topic, availability, and language. Talk now or book a time — sessions from 8 minutes.',
    url: 'https://www.howwasyourday.live/browse',
    type: 'website',
  },
}

const serviceSchema = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: 'How Was Your Day Peer Listener Directory',
  description: 'Browse and connect with real, verified peer listeners for private one-to-one text or voice conversations on loneliness, burnout, relationships, grief, anxiety, and more.',
  url: 'https://www.howwasyourday.live/browse',
  serviceType: 'Peer emotional support',
  provider: {
    '@type': 'Organization',
    name: 'How Was Your Day',
    url: 'https://www.howwasyourday.live',
  },
  areaServed: [{ '@type': 'Country', name: 'United Kingdom' }],
  hasOfferCatalog: {
    '@type': 'OfferCatalog',
    name: 'Peer support sessions',
    // Example prices at the standard text rate (pence → pounds); listeners set their own.
    itemListElement: SESSION_DURATIONS.map(m => ({
      '@type': 'Offer',
      name: `${m}-minute peer support session`,
      description: `${m}-minute text or voice session with a verified peer listener, now or booked for later. Price shown is at the standard rate; each listener sets their own.`,
      price: ((DEFAULT_LISTENER_RATE * m + PLATFORM_FEE) / 100).toFixed(2),
      priceCurrency: 'GBP',
    })),
  },
}

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.howwasyourday.live' },
    { '@type': 'ListItem', position: 2, name: 'Browse Listeners', item: 'https://www.howwasyourday.live/browse' },
  ],
}

export default function BrowseLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      {children}
    </>
  )
}
