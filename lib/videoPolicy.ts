import { SettingsValidationError } from './analyticsPolicy';

export interface VideoSettings {
  homePageVideoUrl: string;
  homePageVideoTitle: string;
}

export const EMPTY_VIDEO_SETTINGS: VideoSettings = { homePageVideoUrl: '', homePageVideoTitle: '' };

// Exact hosts and an exact video ID prevent arbitrary frames and lookalike URLs.
export function getYouTubeVideoId(value: string): string | null {
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:' || url.username || url.password || url.port) return null;
    let id: string | null = null;
    if (url.hostname === 'youtu.be') {
      id = /^\/([A-Za-z0-9_-]{11})\/?$/.exec(url.pathname)?.[1] || null;
    } else if (['youtube.com', 'www.youtube.com', 'm.youtube.com', 'www.youtube-nocookie.com'].includes(url.hostname)) {
      id = url.pathname === '/watch'
        ? url.searchParams.get('v')
        : /^\/(?:embed|shorts)\/([A-Za-z0-9_-]{11})\/?$/.exec(url.pathname)?.[1] || null;
    }
    return id && /^[A-Za-z0-9_-]{11}$/.test(id) ? id : null;
  } catch {
    return null;
  }
}

export function validateVideoSettings(value: unknown): VideoSettings {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new SettingsValidationError('Expected video settings.');
  }
  const input = value as Record<string, unknown>;
  if (Object.keys(input).some(key => !['homePageVideoUrl', 'homePageVideoTitle'].includes(key))) {
    throw new SettingsValidationError('Unknown video setting.');
  }
  if (typeof input.homePageVideoUrl !== 'string' || input.homePageVideoUrl.length > 2048
    || typeof input.homePageVideoTitle !== 'string' || input.homePageVideoTitle.length > 200) {
    throw new SettingsValidationError('Video URL and title must be strings within the allowed length.');
  }
  const homePageVideoUrl = input.homePageVideoUrl.trim();
  if (homePageVideoUrl && !getYouTubeVideoId(homePageVideoUrl)) {
    throw new SettingsValidationError('Use an HTTPS YouTube watch, shorts, embed or youtu.be video URL.');
  }
  // Preserve a valid stored URL instead of silently rewriting production data.
  return { homePageVideoUrl, homePageVideoTitle: input.homePageVideoTitle.trim() };
}
