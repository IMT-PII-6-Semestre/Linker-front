import { useEffect, useState } from 'react';
import { ActivityIndicator, Animated, Easing, StyleSheet, View } from 'react-native';

import { AppSpacing } from '@/app-shell/theme/tokens';
import { useAppTheme } from '@/app-shell/theme/ThemeProvider';
import { AppLogo } from '@/core/ui/AppLogo';

/**
 * Tela de carregamento do app mobile, exibida enquanto o app restaura a
 * sessão. Quem decide quando ela sai é `useAppStartup` — não há timer
 * navegando por conta própria.
 */
export function SplashScreen() {
  const colors = useAppTheme();
  const [progress] = useState(() => new Animated.Value(0));

  useEffect(() => {
    Animated.timing(progress, {
      toValue: 1,
      duration: 600,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();
  }, [progress]);

  const scale = progress.interpolate({ inputRange: [0, 1], outputRange: [0.92, 1] });

  return (
    <View style={[styles.container, { backgroundColor: colors.primary }]}>
      <Animated.View style={{ opacity: progress, transform: [{ scale }], alignItems: 'center' }}>
        <AppLogo size={48} inverse tagline="Para pessoas e empresas reais." />
        <View style={styles.spinner}>
          <ActivityIndicator size="small" color={colors.onPrimary} />
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  spinner: {
    marginTop: AppSpacing.xxl,
  },
});
