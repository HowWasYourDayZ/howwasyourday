// Company and data-protection details shown on /privacy, /terms and /cookies.
// ⚠️ OWNER TO COMPLETE before launch — every value marked TODO is a placeholder
// and is shown publicly as written. UK GDPR requires the controller's identity
// and contact details; a business outside the EU that serves EU users needs an
// EU representative (Art. 27); ICO registration (data protection fee) is a
// legal requirement in the UK.

export const LEGAL = {
  // Data controller / contracting party.
  entityName: 'How Was Your Day Ltd [TODO: confirm legal entity name]',
  companyNumber: '[TODO: Companies House number]',
  registeredAddress: '[TODO: registered office address, United Kingdom]',
  icoRegistration: '[TODO: ICO registration number]',
  // EU Art. 27 representative (needed while there is no EU establishment).
  euRepresentative: '[TODO: EU representative name and address]',
  privacyEmail: 'privacy@howwasyourday.live',
  supportEmail: 'support@howwasyourday.live',
  // Where the main database lives. Create the Supabase project in a UK/EU
  // region (e.g. London, eu-west-2) and keep this line true.
  hostingRegion: 'the United Kingdom / European Economic Area (Supabase, London region)',
  // Governing law for consumers: England and Wales (UK consumers keep their
  // local protections; EU consumers keep the mandatory protections of their
  // country of residence — Rome I Art. 6).
  governingLaw: 'England and Wales',
  // Retention periods stated in the Privacy Policy. ⚠️ An automated job that
  // enforces these does not exist yet (see docs) — keep the policy and the
  // practice in line.
  retention: {
    messages: '12 months after the session, unless the conversation is under review for a report, safety concern or dispute',
    selfie: 'until the listener account is deleted',
    payments: '6 years after the end of the financial year (UK tax and accounting rules)',
    account: 'until you delete your account; contact details are removed within 30 days of deletion',
  },
  lastUpdated: '25 October 2026',
} as const
