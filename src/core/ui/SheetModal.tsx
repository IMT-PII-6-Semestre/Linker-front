import { MaterialIcons } from '@expo/vector-icons';
import type { ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import Animated, { SlideInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppSizes, AppSpacing } from '@/app-shell/theme/tokens';
import { useAppTheme } from '@/app-shell/theme/ThemeProvider';

import { AppModal } from './AppModal';
import { AppText } from './AppText';

interface SheetModalProps {
  visible: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  /** Fica fixo abaixo do conteúdo rolável (ex.: botão Salvar). */
  footer?: ReactNode;
  testID?: string;
}

/**
 * Folha que sobe de baixo (bottom sheet) para edição e detalhes. Fecha no
 * "x", tocando fora ou no voltar do Android. A animação de entrada segue o
 * "reduzir movimento" do sistema (padrão do Reanimated).
 */
export function SheetModal(props: SheetModalProps) {
  return (
    <AppModal visible={props.visible} onRequestClose={props.onClose}>
      <Sheet {...props} />
    </AppModal>
  );
}

/** Conteúdo da folha — fica dentro do SafeAreaProvider do modal. */
function Sheet({ title, onClose, children, footer, testID }: SheetModalProps) {
  const colors = useAppTheme();
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.root}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Fechar"
        onPress={onClose}
        style={[StyleSheet.absoluteFill, { backgroundColor: colors.scrim + 'AA' }]}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={[styles.avoider, { marginTop: insets.top + AppSpacing.lg }]}
        pointerEvents="box-none"
      >
        <Animated.View
          testID={testID}
          entering={SlideInDown.springify().damping(20)}
          accessibilityViewIsModal
          style={[
            styles.sheet,
            { backgroundColor: colors.background, paddingBottom: insets.bottom + AppSpacing.md },
          ]}
        >
          <View style={[styles.handle, { backgroundColor: colors.outlineVariant }]} />
          <View style={styles.header}>
            <AppText variant="heading" accessibilityRole="header" style={styles.title}>
              {title}
            </AppText>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Fechar"
              onPress={onClose}
              hitSlop={8}
              style={styles.close}
            >
              <MaterialIcons name="close" size={24} color={colors.onSurfaceVariant} />
            </Pressable>
          </View>
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {children}
          </ScrollView>
          {footer ? (
            <View style={[styles.footer, { borderTopColor: colors.outlineVariant }]}>{footer}</View>
          ) : null}
        </Animated.View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  avoider: {
    flexShrink: 1,
  },
  sheet: {
    flexShrink: 1,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    width: '100%',
    maxWidth: 640,
    alignSelf: 'center',
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    marginTop: AppSpacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: AppSpacing.lg,
    paddingRight: AppSpacing.sm,
  },
  title: {
    flex: 1,
  },
  close: {
    width: AppSizes.touchTarget,
    height: AppSizes.touchTarget,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: {
    flexGrow: 0,
    flexShrink: 1,
  },
  content: {
    paddingHorizontal: AppSpacing.lg,
    paddingBottom: AppSpacing.md,
    gap: AppSpacing.lg,
  },
  footer: {
    paddingHorizontal: AppSpacing.lg,
    paddingTop: AppSpacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
});
