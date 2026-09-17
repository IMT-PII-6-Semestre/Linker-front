# Linker-front

Front-end do Linker em Flutter. **Um código-base, duas origens:**

| Origem | Público | Entrypoint | Fluxo inicial |
|---|---|---|---|
| **Web** | contratador | `lib/main_web.dart` | login do painel |
| **Mobile** | usuário do app | `lib/main_mobile.dart` | carregamento (splash) → login |

O que difere entre as origens é a moldura das telas e as rotas. Validação,
autenticação, tema, navegação e tratamento de erro são compartilhados — o
formulário de login é literalmente o mesmo widget nas duas.

---

## Pré-requisitos

| | Versão usada |
|---|---|
| Flutter | 3.38.3 (canal stable) |
| Dart | 3.10.1 |

```bash
flutter --version     # confirme antes de começar
flutter doctor        # resolva os [✗] das plataformas que você vai usar
```

Para rodar **web** basta o Chrome. Para **Android**, Android Studio + um
emulador ou device com depuração USB. Para **iOS**, Xcode + CocoaPods (só em
macOS).

## Rodando

Primeiro, uma vez só:

```bash
flutter pub get
```

### Painel web do contratador

```bash
flutter run -d chrome -t lib/main_web.dart
```

### App mobile

```bash
flutter devices                      # veja o que está conectado
flutter run -t lib/main_mobile.dart  # usa o device conectado

# escolhendo explicitamente:
flutter run -d emulator-5554 -t lib/main_mobile.dart
flutter run -d "iPhone 16" -t lib/main_mobile.dart
```

Sem emulador aberto? `flutter emulators` lista os disponíveis e
`flutter emulators --launch <id>` sobe um.

### Sem `-t`

```bash
flutter run
```

`lib/main.dart` escolhe a origem pela plataforma (web → contratador, resto →
mobile). Útil no dia a dia; para forçar uma origem, use os entrypoints acima.

### Credenciais de teste

Ainda não há backend. O `FakeAuthRepository` responde assim:

| Entrada | Resultado |
|---|---|
| qualquer e-mail válido + senha `123456` | entra |
| `offline@linker.com` + `123456` | erro de rede |
| qualquer e-mail válido + outra senha | credenciais inválidas |
| e-mail malformado ou senha < 6 | erro de validação no campo (nem chama a API) |

A sessão fica **em memória**: recarregar a página ou reabrir o app desloga.

## Builds

```bash
flutter build web --release                          # sai em build/web
flutter build apk --debug -t lib/main_mobile.dart    # APK de teste
flutter build appbundle --release                    # AAB para a Play Store
flutter build ipa                                    # iOS (precisa de macOS + Xcode)
```

## Qualidade

Rode os três antes de abrir PR — o CI vai exigir:

```bash
dart format lib test
dart analyze          # precisa terminar com "No issues found!"
flutter test
```

`analysis_options.yaml` é mais rígido que o padrão: `use_build_context_synchronously`,
`unawaited_futures` e `avoid_print` são **erro**, não aviso. Não silencie com
`// ignore:` sem explicar o porquê no código.

## Estrutura

```
lib/
  main.dart              # dispatcher por plataforma
  main_web.dart          # entrypoint do painel do contratador
  main_mobile.dart       # entrypoint do app
  app/
    bootstrap.dart       # runApp + ProviderScope (único lugar que sobe o app)
    app_providers.dart   # appOriginProvider (sobrescrito por entrypoint)
    app_startup.dart     # o que precisa estar pronto antes da 1ª rota
    linker_app.dart      # raiz: decide entre splash, erro e router
    routing/             # rotas e guarda de autenticação
    theme/               # tema e tokens (spacing, radius, breakpoints)
  core/
    app_origin.dart      # enum AppOrigin { web, mobile }
    error/               # Failure (sealed) e Result
    ui/                  # widgets compartilhados
  features/
    auth/
      domain/            # Session, contrato do repositório, validação
      data/              # FakeAuthRepository (trocar pela API real)
      presentation/      # controllers, páginas web/mobile, formulário
    splash/              # carregamento do mobile e loader do web
    home/                # STUB pós-login — próximo milestone
test/
  app/                   # fluxo ponta a ponta (splash → login → home → logout)
  features/auth/         # validação, repositório e formulário
```

Regra de dependência: `presentation → domain ← data`. `domain` não importa
Flutter nem pacote de rede — se precisar, a camada está errada.

### Como as origens divergem

Cada entrypoint injeta um `AppOrigin` sobrescrevendo `appOriginProvider` no
`ProviderScope`. A partir daí a divergência acontece em **três lugares, e só
neles**:

1. `app_router.dart` — quais rotas existem (`/painel` vs `/inicio`) e qual
   página de login montar;
2. `linker_app.dart` — splash de marca (mobile) ou loader discreto (web);
3. `app_startup.dart` — o tempo mínimo de splash, que só o mobile tem.

Qualquer `if (origin.isWeb)` fora desses arquivos é sinal de que a divergência
está vazando para onde não devia.

### Autenticação

A guarda de rota vive num único `redirect` no go_router, que escuta o provider
de sessão. Nenhuma tela navega por conta própria depois do login: o
`SessionController` muda de estado e o router reage. Logout é a mesma coisa ao
contrário.

O `appStartupProvider` segura a primeira rota até a sessão ser restaurada —
isso elimina a corrida entre "restaurar sessão" e "decidir para onde ir".

## Decisões

| Decisão | Escolha | Por quê |
|---|---|---|
| Estado | Riverpod 3, sem codegen | roda com `pub get`, sem passo de `build_runner` |
| Navegação | go_router | guarda de auth num `redirect` só, e URL de verdade no painel |
| Duas origens | mesmo projeto, dois entrypoints | zero duplicação de domínio; vira pacote separado se divergirem muito |
| Erros | `sealed class Failure` + `Result` | `switch` exaustivo obriga a tratar o erro |
| Tema | Material 3 + tokens em `app_tokens.dart` | sem número mágico de padding espalhado |
| i18n | ainda não | strings em pt-BR no código; migrar para ARB antes do 2º idioma |

> Riverpod 3 removeu `AsyncValue.when`. O padrão aqui é `switch` sobre o
> `AsyncValue` (`AsyncError` antes de `AsyncData`, `_` cobrindo o loading).
> Tutorial que usa `.when` é de Riverpod 2.

## Problemas comuns

| Sintoma | O que fazer |
|---|---|
| Erro de build Android/iOS sem sentido | `flutter clean && flutter pub get`; no iOS, `cd ios && pod install` |
| `UnimplementedError: Sobrescreva appOriginProvider` | subiu um widget sem `bootstrap()`; use `ProviderScope(overrides: [appOriginProvider.overrideWithValue(...)])` |
| `flutter run` abre a origem errada | passe `-t lib/main_web.dart` ou `-t lib/main_mobile.dart` |
| Teste de widget travando em `pumpAndSettle` | há um `CircularProgressIndicator` permanente na tela; use `pump(Duration(...))` |

## Próximos passos

1. Substituir `FakeAuthRepository` pela API real (Dio + interceptor de auth).
2. Persistir a sessão em `flutter_secure_storage` e tratar refresh de token.
3. Construir a home real de cada origem no lugar de `HomeStubPage`.
4. Ícone, splash nativa, bundle id e assinatura antes da primeira build de loja.
