import { Redirect } from 'expo-router';

import { AppRoutes } from '@/app-shell/routes';

/** Fallback: o guard em _layout.tsx trata a raiz como equivalente ao login. */
export default function IndexFallback() {
  return <Redirect href={AppRoutes.login} />;
}
