import 'server-only';

import { cache } from 'react';
import { createPublicSettingsReader } from './publicSettings';
import { EMPTY_ANALYTICS_SETTINGS, validateAnalyticsSettings } from './analyticsPolicy';

export const ANALYTICS_SETTINGS_KEY = 'analytics_settings';
export const ANALYTICS_SETTINGS_TAG = 'public-analytics-settings';
const reader = createPublicSettingsReader(ANALYTICS_SETTINGS_KEY, ANALYTICS_SETTINGS_TAG, validateAnalyticsSettings, EMPTY_ANALYTICS_SETTINGS);

export const getAnalyticsSettings = cache(reader.readPublic);
export const readFreshAnalyticsSettings = reader.readFresh;
