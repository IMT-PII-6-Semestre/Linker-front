import { forwardRef, useEffect, useImperativeHandle, type ReactNode } from 'react';
import { StyleSheet, Text, useWindowDimensions, type AccessibilityActionEvent } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import { AppFonts, AppRadius, AppShadows } from '@/app-shell/theme/tokens';
import { useAppTheme } from '@/app-shell/theme/ThemeProvider';
import { useReduceMotion } from '@/core/ui/useReduceMotion';

import type { SwipeDirection } from '../domain/feed';

export interface SwipeCardHandle {
  /** Dispara o swipe por botão/acessibilidade, com a mesma animação do gesto. */
  swipe: (direction: SwipeDirection) => void;
}

interface SwipeCardProps {
  children: ReactNode;
  /** Só o card do topo responde a gestos; o de trás fica menor, esperando. */
  isTop: boolean;
  onSwiped: (direction: SwipeDirection) => void;
  onOpenDetails: () => void;
  /** Resumo lido pelo leitor de tela (título, empresa/cargo...). */
  accessibilityLabel: string;
  testID?: string;
}

const FLY_DURATION = 260;
const VELOCITY_TO_FLY = 800;

/**
 * Card deslizável do feed: arrastar para a direita = match, para a
 * esquerda = passar. O gesto roda na thread de UI; só o resultado final
 * volta para o JS (`onSwiped`).
 */
export const SwipeCard = forwardRef<SwipeCardHandle, SwipeCardProps>(function SwipeCard(
  { children, isTop, onSwiped, onOpenDetails, accessibilityLabel, testID },
  ref,
) {
  const colors = useAppTheme();
  const reduceMotion = useReduceMotion();
  const { width } = useWindowDimensions();
  const threshold = width * 0.28;
  const offscreen = width * 1.5;

  const tx = useSharedValue(0);
  const ty = useSharedValue(0);
  const scale = useSharedValue(isTop ? 1 : 0.94);
  const flying = useSharedValue(false);

  // O card de trás cresce suavemente quando vira o do topo.
  useEffect(() => {
    scale.set(withTiming(isTop ? 1 : 0.94, { duration: reduceMotion ? 0 : 220 }));
  }, [isTop, reduceMotion, scale]);

  const fly = (direction: SwipeDirection) => {
    'worklet';
    if (flying.get()) return;
    flying.set(true);
    const target = direction === 'like' ? offscreen : -offscreen;
    tx.set(
      withTiming(target, { duration: reduceMotion ? 0 : FLY_DURATION }, (finished) => {
        if (finished) scheduleOnRN(onSwiped, direction);
      }),
    );
  };

  useImperativeHandle(ref, () => ({ swipe: (direction) => fly(direction) }));

  const pan = Gesture.Pan()
    .enabled(isTop)
    .activeOffsetX([-12, 12])
    .onUpdate((e) => {
      if (flying.get()) return;
      tx.set(e.translationX);
      ty.set(e.translationY * 0.2);
    })
    .onEnd((e) => {
      if (e.translationX > threshold || e.velocityX > VELOCITY_TO_FLY) fly('like');
      else if (e.translationX < -threshold || e.velocityX < -VELOCITY_TO_FLY) fly('pass');
      else {
        tx.set(withSpring(0, { damping: 15 }));
        ty.set(withSpring(0, { damping: 15 }));
      }
    });

  const cardStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: tx.get() },
      { translateY: ty.get() },
      { rotate: `${interpolate(tx.get(), [-width, 0, width], [-15, 0, 15])}deg` },
      { scale: scale.get() },
    ],
  }));
  const likeStampStyle = useAnimatedStyle(() => ({
    opacity: interpolate(tx.get(), [0, threshold], [0, 1], Extrapolation.CLAMP),
  }));
  const passStampStyle = useAnimatedStyle(() => ({
    opacity: interpolate(tx.get(), [-threshold, 0], [1, 0], Extrapolation.CLAMP),
  }));

  const onAccessibilityAction = (event: AccessibilityActionEvent) => {
    switch (event.nativeEvent.actionName) {
      case 'like':
        fly('like');
        break;
      case 'pass':
        fly('pass');
        break;
      case 'activate':
        onOpenDetails();
        break;
    }
  };

  return (
    <GestureDetector gesture={pan}>
      <Animated.View
        testID={testID}
        pointerEvents={isTop ? 'auto' : 'none'}
        importantForAccessibility={isTop ? 'yes' : 'no-hide-descendants'}
        accessibilityElementsHidden={!isTop}
        accessible={isTop}
        accessibilityRole="adjustable"
        accessibilityLabel={accessibilityLabel}
        accessibilityHint="Deslize para a direita para dar match ou para a esquerda para passar. Toque duas vezes para ver detalhes."
        accessibilityActions={[
          { name: 'like', label: 'Dar match' },
          { name: 'pass', label: 'Passar' },
          { name: 'activate', label: 'Ver detalhes' },
        ]}
        onAccessibilityAction={onAccessibilityAction}
        style={[styles.card, { backgroundColor: colors.surface }, cardStyle]}
      >
        {children}
        <Animated.View style={[styles.stamp, styles.likeStamp, { borderColor: colors.success }, likeStampStyle]}>
          <Text style={[styles.stampText, { color: colors.success }]}>MATCH</Text>
        </Animated.View>
        <Animated.View style={[styles.stamp, styles.passStamp, { borderColor: colors.error }, passStampStyle]}>
          <Text style={[styles.stampText, { color: colors.error }]}>PASSA</Text>
        </Animated.View>
      </Animated.View>
    </GestureDetector>
  );
});

const styles = StyleSheet.create({
  card: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    borderRadius: AppRadius.matchCard,
    overflow: 'hidden',
    ...AppShadows.lg,
  },
  stamp: {
    position: 'absolute',
    top: 28,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderWidth: 4,
    borderRadius: 8,
  },
  likeStamp: {
    left: 20,
    transform: [{ rotate: '-15deg' }],
  },
  passStamp: {
    right: 20,
    transform: [{ rotate: '15deg' }],
  },
  stampText: {
    fontFamily: AppFonts.bold,
    fontSize: 28,
    letterSpacing: 2,
  },
});
