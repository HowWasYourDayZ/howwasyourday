import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sign In — How Was Your Day Peer Support India',
  description: 'Sign in or create your How Was Your Day account. OTP-verified with your mobile number. Start a peer support session in 30 seconds.',
  alternates: { canonical: 'https://www.howwasyourday.live/auth' },
  robots: { index: false, follow: false },
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
