export interface AnalyticsSettings {
  googleAnalyticsId: string;
  googleTagManagerId: string;
}

export const EMPTY_ANALYTICS_SETTINGS: AnalyticsSettings = {
  googleAnalyticsId: '',
  googleTagManagerId: '',
};

export class SettingsValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SettingsValidationError';
  }
}

export function validateAnalyticsSettings(value: unknown): AnalyticsSettings {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new SettingsValidationError('Expected analytics settings.');
  }
  const input = value as Record<string, unknown>;
  if (Object.keys(input).some(key => !['googleAnalyticsId', 'googleTagManagerId'].includes(key))) {
    throw new SettingsValidationError('Unknown analytics setting.');
  }
  const parseId = (key: keyof AnalyticsSettings, pattern: RegExp) => {
    const candidate = input[key];
    if (typeof candidate !== 'string' || candidate.length > 64) {
      throw new SettingsValidationError('Tracking IDs must be strings of at most 64 characters.');
    }
    const id = candidate.trim();
    if (id !== '' && !pattern.test(id)) {
      throw new SettingsValidationError('Enter a GA4 G- identifier or GTM GTM- identifier, not script code.');
    }
    return id;
  };
  return {
    googleAnalyticsId: parseId('googleAnalyticsId', /^G-[A-Z0-9]+$/),
    googleTagManagerId: parseId('googleTagManagerId', /^GTM-[A-Z0-9]+$/),
  };
}

// Keep data out of JavaScript syntax, including HTML script-closing sequences.
export function serializeScriptValue(value: string): string {
  return JSON.stringify(value).replace(/</g, '\\u003c').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');
}

export function getAnalyticsScripts(value: unknown) {
  const settings = validateAnalyticsSettings(value);
  return {
    ga: settings.googleAnalyticsId ? `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', ${serializeScriptValue(settings.googleAnalyticsId)});
    ` : '',
    gtm: settings.googleTagManagerId ? `
      (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
      new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
      j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
      'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
      })(window,document,'script','dataLayer',${serializeScriptValue(settings.googleTagManagerId)});
    ` : '',
  };
}
