import 'server-only';
import { kv } from '@vercel/kv';
import developmentSettings from './videoSettings.json';

export type VideoSettings = { homePageVideoUrl: string; homePageVideoTitle: string };
const emptySettings: VideoSettings = { homePageVideoUrl: '', homePageVideoTitle: '' };

/** Optional public content, loaded before HTML so a video never shifts the page. */
export async function getVideoSettings(): Promise<VideoSettings> {
  if (!process.env.KV_REST_API_URL && !process.env.KV_REST_API_TOKEN) {
    return process.env.NODE_ENV === 'development' ? developmentSettings : emptySettings;
  }
  try {
    const settings = await kv.get<VideoSettings>('videoSettings');
    if (!settings) return emptySettings;
    return {
      homePageVideoUrl: typeof settings.homePageVideoUrl === 'string' ? settings.homePageVideoUrl : '',
      homePageVideoTitle: typeof settings.homePageVideoTitle === 'string' ? settings.homePageVideoTitle : '',
    };
  } catch {
    return emptySettings;
  }
}
