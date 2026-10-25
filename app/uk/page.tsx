import type { Metadata } from 'next'
import CountrySeoPage from '@/app/country-seo-page'
import { COUNTRY_SEO_BY_SLUG } from '@/lib/country-seo'
const data = COUNTRY_SEO_BY_SLUG.uk
export const metadata: Metadata = { title: data.title, description: data.description, keywords: data.searchTerms, alternates: { canonical: 'https://www.howwasyourday.live/uk' }, openGraph: { title: data.title, description: data.description, url: 'https://www.howwasyourday.live/uk', type: 'website', siteName: 'How Was Your Day' } }
export default function Page() { return <CountrySeoPage data={data} /> }
