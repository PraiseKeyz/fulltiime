
export const GA_ID = process.env.NEXT_PUBLIC_GA_ID

/** GA loads only in a production build that actually has a measurement ID. */
export const ANALYTICS_ENABLED = process.env.NODE_ENV === 'production' && !!GA_ID

/** localStorage key holding the visitor's choice: 'granted' | 'denied'. */
export const CONSENT_KEY = 'ft_cookie_consent'

export type ConsentChoice = 'granted' | 'denied'

/** Read the stored consent choice (null = never asked). Safe on the server. */
export function getStoredConsent(): ConsentChoice | null {
  if (typeof window === 'undefined') return null
  try {
    const v = window.localStorage.getItem(CONSENT_KEY)
    return v === 'granted' || v === 'denied' ? v : null
  } catch {
    return null
  }
}

/** Persist the choice and push a Consent Mode v2 update to gtag. */
export function setConsent(choice: ConsentChoice) {
  try {
    window.localStorage.setItem(CONSENT_KEY, choice)
  } catch {
    /* storage blocked — still update gtag for this session */
  }
  window.gtag?.('consent', 'update', {
    analytics_storage: choice,
  })
}

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void
  }
}
