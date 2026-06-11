import Script from 'next/script'
import { GoogleAnalytics } from '@next/third-parties/google'
import { ANALYTICS_ENABLED, GA_ID, CONSENT_KEY } from '@/lib/analytics'

// Consent Mode v2 defaults — everything denied until the visitor accepts, except
// that we honour a previously-stored 'granted' choice so returning visitors are
// measured immediately. Must run BEFORE gtag config, so it's `beforeInteractive`
// (Next hoists it into <head> ahead of the GA script).
const consentDefault = `
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
var c = 'denied';
try { if (localStorage.getItem('${CONSENT_KEY}') === 'granted') c = 'granted'; } catch (e) {}
gtag('consent', 'default', {
  ad_storage: 'denied',
  ad_user_data: 'denied',
  ad_personalization: 'denied',
  analytics_storage: c,
  wait_for_update: 500
});
`

export function Analytics() {
  if (!ANALYTICS_ENABLED || !GA_ID) return null

  return (
    <>
      <Script
        id="ga-consent-default"
        strategy="beforeInteractive"
        dangerouslySetInnerHTML={{ __html: consentDefault }}
      />
      <GoogleAnalytics gaId={GA_ID} />
    </>
  )
}
