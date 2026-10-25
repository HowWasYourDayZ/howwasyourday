import type { Metadata } from 'next'
import CountrySeoPage from '@/app/country-seo-page'
import { COUNTRY_SEO_BY_SLUG } from '@/lib/country-seo'
const data = COUNTRY_SEO_BY_SLUG.singapore
export const metadata: Metadata = { title: data.title, description: data.description, keywords: data.searchTerms, alternates: { canonical: 'https://www.howwasyourday.live/singapore' }, openGraph: { title: data.title, description: data.description, url: 'https://www.howwasyourday.live/singapore', type: 'website', siteName: 'How Was Your Day' } }
export default function Page() { return <CountrySeoPage data={data} /> }
