import { useAppOrigin } from '@/app-shell/AppProviders';
import { isWeb } from '@/app-shell/origin';

import { LoginScreenMobile } from './LoginScreenMobile';
import { LoginScreenWeb } from './LoginScreenWeb';

/** Escolhe a moldura de login pela origem em execução. */
export function LoginScreen() {
  const origin = useAppOrigin();
  return isWeb(origin) ? <LoginScreenWeb /> : <LoginScreenMobile />;
}
