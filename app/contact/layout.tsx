import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contact Us — How Was Your Day Peer Support',
  description: "Get in touch with the How Was Your Day team. Questions about peer support, your account, or becoming a listener — we're here to help.",
  keywords: ['contact howwasyourday', 'howwasyourday support', 'howwasyourday help'],
  alternates: { canonical: 'https://www.howwasyourday.live/contact' },
}

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
