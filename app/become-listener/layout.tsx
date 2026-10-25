import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Become a How Was Your Day Listener',
  robots: { index: false, follow: false },
  alternates: { canonical: 'https://www.howwasyourday.live/become-listener' },
}

export default function BecomeListenerLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
