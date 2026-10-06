/* global jest */
// Reanimated 4 / Worklets / Gesture Handler dependem de módulos nativos:
// nos testes usamos os mocks oficiais de cada lib.
require('react-native-gesture-handler/jestSetup');
jest.mock('react-native-worklets', () => require('react-native-worklets/lib/module/mock'));
jest.mock('react-native-reanimated', () => require('react-native-reanimated/mock'));
