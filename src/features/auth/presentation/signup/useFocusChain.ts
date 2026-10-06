import { useRef } from 'react';
import type { TextInput } from 'react-native';

/**
 * Encadeia o foco entre campos de texto: o "próximo" do teclado leva ao
 * campo seguinte. `ref(i)` vai no campo i; `next(i)` foca o i + 1.
 */
export function useFocusChain() {
  const refs = useRef<(TextInput | null)[]>([]);
  return {
    ref: (index: number) => (input: TextInput | null) => {
      refs.current[index] = input;
    },
    next: (index: number) => () => refs.current[index + 1]?.focus(),
  };
}
