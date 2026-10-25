import type { Metadata } from 'next'

// Help page for turning on How Was Your Day alerts on a device. Not for search results.
export const metadata: Metadata = {
  title: 'Turn on How Was Your Day alerts',
  description: 'Check whether How Was Your Day alerts work on this phone or computer, and fix them step by step.',
  robots: { index: false, follow: false },
}

export default function AlertsSetupLayout({ children }: { children: React.ReactNode }) {
  return children
}
