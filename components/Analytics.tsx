import Script from 'next/script';
import { getAnalyticsScripts, validateAnalyticsSettings, type AnalyticsSettings } from '@/lib/analyticsPolicy';

export default function Analytics({ initialSettings }: { initialSettings: AnalyticsSettings }) {
  // Validate again at the script boundary; database contents are not executable code.
  const settings = validateAnalyticsSettings(initialSettings);
  const scripts = getAnalyticsScripts(settings);
  const gaId = settings.googleAnalyticsId;
  const gtmId = settings.googleTagManagerId;

  return (
    <>
      {gaId && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(gaId)}`} strategy="afterInteractive" />
          <Script id="google-analytics" strategy="afterInteractive">{scripts.ga}</Script>
        </>
      )}
      {gtmId && (
        <>
          <Script id="google-tag-manager" strategy="afterInteractive">{scripts.gtm}</Script>
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${encodeURIComponent(gtmId)}`}
              title="Google Tag Manager"
              height="0"
              width="0"
              style={{ display: 'none', visibility: 'hidden' }}
            />
          </noscript>
        </>
      )}
    </>
  );
}
