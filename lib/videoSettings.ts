import 'server-only';
import { cache } from 'react';
import developmentSettings from './videoSettings.json';
import { createPublicSettingsReader } from './publicSettings';
import { EMPTY_VIDEO_SETTINGS, validateVideoSettings } from './videoPolicy';
export type { VideoSettings } from './videoPolicy';

export const VIDEO_SETTINGS_KEY = 'videoSettings';
export const VIDEO_SETTINGS_TAG = 'public-video-settings';
const reader = createPublicSettingsReader(VIDEO_SETTINGS_KEY, VIDEO_SETTINGS_TAG, validateVideoSettings, EMPTY_VIDEO_SETTINGS);

/** Read before the HTML so the optional video never inserts a late layout shift. */
export const getVideoSettings = cache(async () => {
  if (process.env.NODE_ENV === 'development' && !process.env.KV_REST_API_URL && !process.env.KV_REST_API_TOKEN) {
    return validateVideoSettings(developmentSettings);
  }
  return reader.readPublic();
});
export const readFreshVideoSettings = reader.readFresh;
