/* global jest */
// Gesture Handler depende de módulo nativo: usamos o mock oficial.
// Reanimated 4.7 / Worklets rodam a implementação web (resolver no jest.config.js).
require('react-native-gesture-handler/jestSetup');
require('react-native-reanimated').setUpTests();

// Com o Worklets web, o Gesture Handler nativo quebra ao pedir o runtime da UI
// (`getUIRuntimeHolder` não existe no web): usamos o no-op da versão web dele.
for (const dir of ['src', 'lib/module']) {
  jest.mock(`react-native-gesture-handler/${dir}/handlers/gestures/installUIRuntimeBindings`, () => ({
    installUIRuntimeBindings: () => {},
  }));
}
