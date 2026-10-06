# Linker

Rede social que une o modelo de vagas/candidatos do LinkedIn com o algoritmo de match bilateral (swipe) do Tinder — Projeto Integrador Interdisciplinar (PII), 3º ano de Ciência da Computação.

Expo (SDK 57) + React Native + TypeScript + Expo Router + Zustand. Um único código-base atende duas audiências:

- **mobile** — app de **candidatos e empresas**: cadastro, login, feed com swipe, perfil e chat
- **web** — **painel administrativo** (métricas da plataforma), só para contas `admin`

A origem é escolhida no boot (pela plataforma, ou forçada via `EXPO_PUBLIC_APP_ORIGIN`) e define o layout das telas, as rotas liberadas e a audiência enviada no token.

## Rodando

```bash
npm install
npx expo start -c        # -c limpa o cache do Metro (use após trocar de branch/dependência)
```

- **Celular:** escaneie o QR code com o Expo Go → origem `mobile`.
- **Navegador:** aperte `w` → origem `web` (painel admin).
- Para abrir o **app mobile no navegador** (útil para testar sem celular): `npm run start:mobile` e depois `w`.

## Contas de teste

Ainda não há backend: todas as features usam repositórios **fake em memória**. Recarregar o app (`r` no terminal / F5) apaga sessões e contas criadas.

| E-mail | Senha | Papel | Onde usar |
|---|---|---|---|
| `ana@email.com` (qualquer e-mail comum) | `123456` | candidato | app mobile |
| `rh@empresa.com` (qualquer e-mail com "empresa") | `123456` | empresa | app mobile |
| `admin@linker.com` | `123456` | admin | painel web |
| `offline@linker.com` | qualquer | — | simula falha de rede |

Contas criadas pelo cadastro entram com a senha cadastrada. Outras simulações:

- **Feed:** buscar a palavra `offline` simula erro. Dão match ao curtir: TechNova, Agência Rocket, Loja Estilo Sul e Clínica Bem Viver (vagas); Alexandre Silva, Carlos Mendes e Eduardo Lima (currículos).
- **Chat:** o outro lado responde ~1,5s depois de você enviar; mensagem contendo `offline` falha (com "tentar de novo").
- **Admin no celular:** vê só o aviso "Use o painel web" (sem abas).
- **Empresa/candidato no web:** vê "Acesso restrito".

## Telas

| # | Tela | Rota | Destaques |
|---|---|---|---|
| 1 | Cadastro | `/cadastro` | escolha candidato/empresa + wizard por etapas, validação de CPF/CNPJ/CEP/datas, máscaras |
| 2 | Login | `/login` | mobile e web (duas colunas no web largo) |
| 3 | Perfil | `/perfil` | tudo do cadastro, editável por seção; foto opcional; empresa gerencia vagas |
| 4 | Feed | `/feed` | swipe (gesto + botões + ações de acessibilidade), busca, filtro de região, detalhes, "It's a match!" |
| 5 | Chat | `/chat`, `/chat/[id]` | só texto (emojis removidos), envio otimista, desfazer match / bloquear / denunciar |
| 6 | Admin | `/painel` (web) | total de usuários, empregados, empregadores, matches, % de indicações que viraram match, média de vagas por empresa, média de idade |

## Arquitetura

Pastas por feature, sempre com a mesma separação:

- `domain/` — tipos, regras e validações (funções puras, testáveis)
- `data/` — repositórios (`Fake*Repository` hoje; a API real entra aqui)
- `state/` — stores Zustand *vanilla*, criadas e injetadas pelo `AppProviders`
- `presentation/` — telas e componentes

```
app/                          # Expo Router — arquivos finos, delegam para src/
  _layout.tsx                  # providers + Stack.Protected (quem vê qual rota)
  index.tsx                    # splash / erro de startup
  login.tsx, cadastro.tsx, painel.tsx, somente-web.tsx, +not-found.tsx
  (app)/                       # abas do app mobile (candidato/empresa)
    _layout.tsx                 # Tabs: Perfil · Vagas/Talentos · Chat
    feed.tsx, perfil.tsx
    chat/_layout.tsx, chat/index.tsx, chat/[id].tsx
src/
  app-shell/                   # origem, rotas, tema (cores + tokens), AppProviders, startup
  core/
    error/                      # Result<T> / Failure — erros tipados
    format/                     # máscaras (CPF, CNPJ, CEP, telefone, data)
    ui/                         # Design System: AppText, Button, TextField, ChipSelect, TagInput,
                                #   Card, Avatar, SheetModal, ConfirmDialog, AppModal, SearchBar...
  features/
    auth/      profile/   feed/   chat/   admin/   splash/
```

### Decisões importantes

- **Navegação:** o `app/_layout.tsx` renderiza **sempre** o mesmo `<Stack>` e usa `Stack.Protected` para liberar rotas conforme startup, sessão, papel e origem. Ninguém navega na mão para entrar/sair — a UI só muda a sessão. *Não* trocar o navegador por `<Redirect>`/`<SplashScreen>` no layout raiz: isso remontava o app após o login e perdia a sessão.
- **Integração com o back-end:** a sessão vem da `useSessionStore` (via `AppProviders`). Cada feature tem uma interface de repositório — trocar o fake pela API não toca nas telas.
- **Estilo:** `StyleSheet` + `useAppTheme()`. **Não usamos NativeWind/Tailwind** (a instalação pela metade quebrava o Metro). O Design System vem do protótipo `mvp.html`: roxo `#7B2CBF`, lilás `#C77DFF`, fundo `#F4F4F9`, fonte Poppins; tema claro e escuro.
- **Modais:** usar sempre `AppModal` (ou `SheetModal`/`ConfirmDialog`, que já o usam). O `Modal` cru do RN invade a barra de navegação do Android.
- **Animações:** Reanimated 4 + Gesture Handler. Respeitam "reduzir movimento" do sistema (`useReduceMotion`). Evite um campo chamado `value` em objetos usados em estilo inline — o plugin do Reanimated confunde com shared value.
- **Navegar para dentro de outra aba** (ex.: do feed para `/chat/[id]`): usar `router.navigate(href, { withAnchor: true })` para a tela inicial da aba ficar embaixo.
- **Gráficos do painel:** cores de dado validadas para daltonismo (`dataSeries1/2`, `dataTrack` no tema); todo gráfico tem alternativa em tabela.

## Scripts

```bash
npm test          # jest + @testing-library/react-native (115 testes)
npm run lint      # eslint
npm run typecheck # tsc --noEmit
npx expo export --platform web      # empacota com o Metro (pega erro de bundle sem abrir o app)
npx expo export --platform android
```

Nos testes, `@testing-library/react-native` v14 tem `render` e `fireEvent` **assíncronos** — sempre use `await`.

## Limitações conhecidas

- Sem backend: dados em memória, somem ao recarregar.
- Bloquear alguém no chat ainda não o esconde do feed.
- O feed não usa o perfil para ordenar/recomendar (mostra os mesmos exemplos).
- Chat atualiza por consulta periódica (2,5s), não por websocket.

## Sugestões (anotações para próximas versões)

- [ ] Melhorar a paleta de cores do web.
- [ ] Permitir que usuários que não são admin (candidatos e empresas) também usem pela web.
- [ ] Opção de navegação no feed com visualização de mais cards por vez (ex.: grade/lista além do swipe).
- [ ] Ajustar o botão no card de descrição (detalhes da vaga/currículo).
- [ ] Opção de mandar uma mensagem automática ao dar match.
- [ ] Integração com agenda para marcar horário de reunião/entrevista pelo chat.
