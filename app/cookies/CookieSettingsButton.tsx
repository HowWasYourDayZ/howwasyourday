'use client'
import { openCookieSettings } from '@/app/components/CookieConsent'

export default function CookieSettingsButton() {
  return (
    <button type="button" onClick={openCookieSettings} className="cs-btn">
      Change cookie settings
    </button>
  )
}
