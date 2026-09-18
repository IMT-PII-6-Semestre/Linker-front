import { router } from 'expo-router';

import { AppRoutes } from '@/app-shell/routes';
import { NotFoundScreen } from '@/core/ui/NotFoundScreen';

export default function NotFoundRoute() {
  return <NotFoundScreen onGoHome={() => router.replace(AppRoutes.login)} />;
}
