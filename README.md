# Linker

Rede social que une o modelo de vagas/candidatos do LinkedIn com o algoritmo de match bilateral (swipe) do Tinder — Projeto Integrador Interdisciplinar (PII), 3º ano de Ciência da Computação.

Expo + React Native + TypeScript. Um único código-base atende duas audiências:

- **web** — painel do contratador ("empresa"/"contratador")
- **mobile** — app do candidato ("app")

A origem em execução é escolhida no boot (por plataforma, ou forçada via `EXPO_PUBLIC_APP_ORIGIN`) e propaga o layout de tela, as rotas de destino pós-login e a audiência enviada no token.

## Arquitetura

Pastas por feature, com a mesma separação `domain` / `data` / `state` / `presentation`:

```
app/                      # Expo Router (file-based) — arquivos finos, delegam para src/
  _layout.tsx              # AppProviders + gate de startup + guarda de auth (<Redirect/>) + <Slot/>
  login.tsx, painel.tsx, inicio.tsx, +not-found.tsx, index.tsx
src/
  app-shell/                # origem, rotas, tema, DI (AppProviders), gate de startup
  core/
    error/                   # Result<T> / Failure — modelo de erro tipado
    ui/                      # componentes compartilhados (Button, TextField, FailureBanner, ...)
  features/
    auth/{domain,data,state,presentation}/
    home/presentation/
    splash/presentation/
```

A guarda de autenticação é um único ponto de decisão em `app/_layout.tsx`: nenhuma tela navega por conta própria, tudo reage à sessão (Zustand) e ao segmento de rota atual.

## Rodando

```bash
npm install
npm run start:web      # painel do contratador
npm run start:mobile   # app do candidato (Expo Go / simulador)
```

## Estado atual

Autenticação usa um `FakeAuthRepository` em memória (sem backend ainda):

- senha `123456` → sucesso
- e-mail `offline@linker.com` → falha de rede simulada
- qualquer outra senha → credenciais inválidas

A tela pós-login é um stub — as features de produto (vagas, candidatos, swipe, matches, chat) ainda não foram implementadas.

## Scripts

```bash
npm test         # jest + @testing-library/react-native
npm run lint      # eslint
npm run typecheck # tsc --noEmit
```
