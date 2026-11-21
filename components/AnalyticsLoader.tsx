import 'server-only';
import Analytics from './Analytics';
import { getAnalyticsSettings } from '@/lib/analyticsSettings';

// The layout wraps this optional read in Suspense so it cannot hold up the hero.
export default async function AnalyticsLoader() {
  return <Analytics initialSettings={await getAnalyticsSettings()} />;
}
