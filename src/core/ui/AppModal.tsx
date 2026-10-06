import type { ReactNode } from 'react';
import { Modal } from 'react-native';
import { SafeAreaProvider, useSafeAreaFrame, useSafeAreaInsets } from 'react-native-safe-area-context';

interface AppModalProps {
  visible: boolean;
  onRequestClose: () => void;
  animationType?: 'none' | 'slide' | 'fade';
  children: ReactNode;
}

/**
 * `Modal` do app. O Modal do RN abre numa janela nativa separada: sem isto,
 * no Android o conteúdo invade a barra de navegação do sistema (◁ ○ □) e a
 * área segura medida é a da tela de trás.
 *
 * - Desenha sob status e navigation bar (igual em todo Android, edge-to-edge).
 * - Tem o próprio SafeAreaProvider, começando com as medidas da tela mãe,
 *   para `useSafeAreaInsets()` dentro do modal valer para a janela do modal.
 */
export function AppModal({ visible, onRequestClose, animationType = 'fade', children }: AppModalProps) {
  const insets = useSafeAreaInsets();
  const frame = useSafeAreaFrame();

  return (
    <Modal
      visible={visible}
      transparent
      animationType={animationType}
      onRequestClose={onRequestClose}
      statusBarTranslucent
      navigationBarTranslucent
    >
      <SafeAreaProvider initialMetrics={{ insets, frame }}>{children}</SafeAreaProvider>
    </Modal>
  );
}
