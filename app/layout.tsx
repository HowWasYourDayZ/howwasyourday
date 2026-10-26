import type { Metadata, Viewport } from 'next'
import './globals.css'
// Nunito is self-hosted (served from our own domain) — loading it from Google
// Fonts would send every visitor's IP address to Google (GDPR).
import '@fontsource/nunito/400.css'
import '@fontsource/nunito/500.css'
import '@fontsource/nunito/600.css'
import '@fontsource/nunito/700.css'
import '@fontsource/nunito/800.css'
import '@fontsource/nunito/900.css'
import BottomNav from './components/BottomNav'
import ToastProvider from './components/ToastProvider'
import ErrorBoundary from './components/ErrorBoundary'
import FloatingCTA from './components/FloatingCTA'
import ListenerPresence from './components/ListenerPresence'
import SiteFooter from './components/SiteFooter'
import ServiceWorkerRegister from './components/ServiceWorkerRegister'
import CookieConsent from './components/CookieConsent'
import { SERVICE_DESCRIPTION } from '@/lib/service-facts'

const countries = ['United Kingdom'] // UK-only launch (PROJECT.md §14)
// Google Analytics loads only after cookie consent (app/components/CookieConsent.tsx).
const GA_ID = process.env.NEXT_PUBLIC_GA_ID

export const metadata: Metadata = {
  metadataBase: new URL('https://www.howwasyourday.live'),
  title: { default: 'How Was Your Day — Talk It Through With a Real Person | UK', template: '%s' },
  description: 'Had a day? Talk it through with a real person who listens — by text or voice, in 8, 16 or 32 minutes. Private peer support for adults in the UK.',
  manifest: '/manifest.json',
  icons: { icon: '/icon-192.png', apple: '/apple-touch-icon.png' },
  keywords: [
    'howwasyourday','How Was Your Day','How Was Your Day app','peer support','peer support online','peer emotional support','peer listener','emotional support','emotional support online','human emotional support','mental health support','mental health support online','talk to someone online','talk to a real person online','real human listener','human connection online','someone to talk to','someone to listen to me','active listening','empathetic listening','empathetic listener','empathy','empathy in peer support','peer counselling','peer support vs counselling','counselling vs peer support','peer support vs therapy','online counselling alternative','support for loneliness','relationship support','burnout support','grief support',
  ],
  authors: [{ name: 'How Was Your Day' }], creator: 'How Was Your Day', publisher: 'How Was Your Day',
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, 'max-snippet': -1, 'max-image-preview': 'large' } },
  openGraph: { type:'website', locale:'en_GB', siteName:'How Was Your Day', title:'How Was Your Day — Talk It Through With a Real Person', description:'Talk it through with a real person who listens, by text or voice. 8 minutes is enough. Peer support for adults in the UK.' },
  twitter: { card:'summary_large_image', site:'@howwasyourdayapp', title:'How Was Your Day — Talk It Through With a Real Person', description:'A real person who listens, by text or voice. 8 minutes is enough.' },
  verification: { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION ?? undefined },
}

export const viewport: Viewport = { themeColor:'#E8743B', width:'device-width', initialScale:1 }

const organizationJsonLd = {
  '@context':'https://schema.org','@type':'Organization','@id':'https://www.howwasyourday.live/#organization',name:'How Was Your Day',alternateName:['HWYD','howwasyourday','How Was Your Day App'],url:'https://www.howwasyourday.live',logo:{'@type':'ImageObject',url:'https://www.howwasyourday.live/icon-512.png',width:512,height:512},
  description:'How Was Your Day is a UK peer support platform connecting adults with real human peer listeners through private text and voice conversations.',
  disambiguatingDescription:'How Was Your Day is the peer support platform at howwasyourday.live.',foundingLocation:{'@type':'Country',name:'United Kingdom'},areaServed:countries.map(name=>({'@type':'Country',name})),serviceType:'Peer Support',
  knowsAbout:['peer support','peer emotional support','mental health support','emotional support','human connection','empathy','empathetic listening','active listening','peer listener','loneliness support','relationship support','work stress','burnout support','grief support','student stress','counselling','peer support vs counselling','peer support vs therapy','real human conversation'],
  sameAs:['https://www.instagram.com/howwasyourdayapp','https://twitter.com/howwasyourdayapp','https://www.linkedin.com/company/howwasyourdayapp'],contactPoint:[{'@type':'ContactPoint',contactType:'customer support',email:'contact@howwasyourday.live',availableLanguage:['English']}] ,
}
const webSiteJsonLd={'@context':'https://schema.org','@type':'WebSite','@id':'https://www.howwasyourday.live/#website',url:'https://www.howwasyourday.live',name:'How Was Your Day',alternateName:['HWYD','How Was Your Day App'],publisher:{'@id':'https://www.howwasyourday.live/#organization'}}
const webAppJsonLd={'@context':'https://schema.org','@type':'WebApplication','@id':'https://www.howwasyourday.live/#webapplication',name:'How Was Your Day',url:'https://www.howwasyourday.live',applicationCategory:'HealthApplication',operatingSystem:'Any web browser (Android, iPhone, computer) — no download needed',description:'Peer emotional support through real human listeners. How Was Your Day provides non-clinical peer support and human connection for people who want a private text or voice conversation. It is not therapy and does not replace emergency or clinical care.',provider:{'@id':'https://www.howwasyourday.live/#organization'},areaServed:countries.map(name=>({'@type':'Country',name})),audience:{'@type':'Audience',audienceType:'Adults seeking peer support, emotional support and human connection'},offers:{'@type':'Offer',priceCurrency:'GBP',description:'Paid sessions of 8, 16 or 32 minutes; each listener sets a per-minute price, shown before booking.'}}
const serviceJsonLd={'@context':'https://schema.org','@type':'Service','@id':'https://www.howwasyourday.live/#service',name:'How Was Your Day Peer Support',serviceType:'Peer Support',alternateName:['Peer Support Session','Online Listener Session','Emotional Support Chat'],provider:{'@id':'https://www.howwasyourday.live/#organization'},description:SERVICE_DESCRIPTION,category:'Peer Support',areaServed:countries.map(name=>({'@type':'Country',name})),availableLanguage:['English']}

export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en-GB"><head><script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(organizationJsonLd)}}/><script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(webSiteJsonLd)}}/><script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(webAppJsonLd)}}/><script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(serviceJsonLd)}}/><link rel="author" type="text/plain" href="https://www.howwasyourday.live/llms.txt"/><link rel="apple-touch-icon" href="/apple-touch-icon.png"/><meta name="apple-mobile-web-app-capable" content="yes"/><meta name="apple-mobile-web-app-status-bar-style" content="default"/><meta name="apple-mobile-web-app-title" content="How Was Your Day"/>{process.env.NEXT_PUBLIC_BING_VERIFICATION&&<meta name="msvalidate.01" content={process.env.NEXT_PUBLIC_BING_VERIFICATION}/>}</head><body style={{margin:0,padding:0}}><ErrorBoundary>{children}</ErrorBoundary><SiteFooter/><BottomNav/><FloatingCTA/><ListenerPresence/><ToastProvider/><ServiceWorkerRegister/><CookieConsent gaId={GA_ID}/></body></html>}
