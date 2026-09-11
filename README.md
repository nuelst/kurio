# NFT Marketplace

Solução em desenvolvimento para o [desafio frontend](CHALLENGE.md) de um marketplace de NFTs. O enunciado original do desafio foi preservado em [CHALLENGE.md](CHALLENGE.md).

## Status atual

As **9 telas do enunciado estão implementadas** — Início/Catálogo, Detalhe do NFT, Carrinho, Login, Cadastro, Perfil, Carteiras, Pagamento e Confirmação de pedido — seguindo o padrão descrito em [ARCHITECTURE.md](ARCHITECTURE.md).

| Área | Cobertura |
| --- | --- |
| Catálogo | Busca, filtro por categoria/preço, ordenação e paginação refletidos na URL (sobrevivem a refresh/histórico) |
| Detalhe do NFT | Galeria com zoom, quantidade/estoque, favoritar, compartilhar, "mais desta coleção", 404 tratado |
| Carrinho | Adicionar/editar/remover, cupom, totais sempre da API, carrinho de visitante migra ao logar, preço/estoque em tempo real |
| Conta | Login/cadastro via modal, sessão persistida, perfil (dados/avatar/senha), carteiras (principal/secundária) |
| Pagamento | Seleção de carteira/rede com conexão/recusa/desconexão simuladas, revalidação de cotação, idempotência, expiração de sessão sem perder o formulário |
| Confirmação | Pedido `pending → confirmed/declined` via Socket.IO, recibo imutável, recuperação após refresh |
| Tempo real | `nft.updated` e `order.updated` refletidos em catálogo/carrinho/pagamento/pedido, reconciliação pós-reconexão |
| Mocks | MSW + `@mswjs/data`, cenários de rede configuráveis (ver abaixo) |
| Testes | Playwright — funcionais, acessibilidade e regressão visual, 3 viewports |
| Performance | Lighthouse — ver [lighthouse/REPORT.md](lighthouse/REPORT.md) |

Chrome fora do escopo (busca global, nav secundária, filtro por rede, links do footer, OAuth/recuperação de senha, itens fora do sidebar de conta) mostra um toast "chega em breve" em vez de simular sucesso — detalhes e decisões de UX em [ARCHITECTURE.md](ARCHITECTURE.md).

## Stack

React, TypeScript, Vite, TanStack Router, TanStack Query, Axios, Socket.IO, Zustand, React Hook Form + Zod, Tailwind CSS, shadcn/ui, MSW + `@mswjs/data` + `@mswjs/socket.io-binding`, Playwright, Lighthouse. Lint/formatação: Biome. Gerenciador de pacotes: Bun.

## Setup

```bash
bun install
cp .env.example .env
bun run dev
```

A aplicação sobe com os mocks (MSW) ativos por padrão — não é necessário nenhum backend.

### Variáveis de ambiente

| Variável            | Padrão           | Descrição                                                                  |
| ------------------- | ---------------- | -------------------------------------------------------------------------- |
| `VITE_API_BASE_URL` | `/api`           | Base das chamadas REST (interceptadas pelo MSW).                           |
| `VITE_SOCKET_URL`   | _(origem atual)_ | URL do servidor Socket.IO (interceptado pelo MSW em dev/demo).             |
| `VITE_ENABLE_MOCKS` | `true`           | Defina como `false` para desativar o MSW (ex.: apontar para uma API real). |

## Comandos

| Comando                           | Descrição                                                                             |
| --------------------------------- | ------------------------------------------------------------------------------------- |
| `bun run dev`                     | Servidor de desenvolvimento com mocks ativos.                                         |
| `bun run build`                   | Typecheck + build de produção (mocks incluídos, controlados por `VITE_ENABLE_MOCKS`). |
| `bun run preview`                 | Serve o build de produção localmente — é o "build de demonstração".                   |
| `bun run typecheck`               | Verificação de tipos (`tsc -b`).                                                      |
| `bun run lint` / `lint:fix`       | Biome (lint).                                                                         |
| `bun run format` / `format:check` | Biome (formatação).                                                                   |
| `bun run check`                   | Biome — lint + formatação + organização de imports, com correção automática.          |
| `bun run test:e2e`                | Testes Playwright (builda, sobe o preview e executa Chromium desktop + mobile + tablet). |
| `bun run test:e2e:ui`             | Testes Playwright em modo interativo.                                                 |
| `bun run lighthouse`              | Build + auditoria Lighthouse (Início/Detalhe do NFT, mobile/desktop, 3 runs cada).     |

Relatório HTML do Playwright fica em `playwright-report/` após `test:e2e` (não versionado); para abri-lo: `bunx playwright show-report`. Relatório da auditoria Lighthouse fica em [lighthouse/REPORT.md](lighthouse/REPORT.md) (versionado, junto dos relatórios HTML/JSON individuais em `lighthouse/reports/`).

## Credenciais fictícias

Use o botão **Entrar** no header para abrir o modal de login/cadastro. Usuários já seedados (`src/mocks/seed.ts`) — a senha é armazenada com hash (SHA-256 + sal fixo) no "banco" mockado, nunca em claro:

| Email               | Senha      |
| ------------------- | ---------- |
| `ana@example.com`   | `demo1234` |
| `bruno@example.com` | `demo1234` |

Ou clique em **Criar conta** para cadastrar um usuário novo (e-mails já usados retornam conflito 409).

Cupons promocionais seedados (campo "Código promocional" no carrinho): `LAUNCH10` (10% de desconto, válido) e `EXPIRED5` (5%, já expirado — retorna 410) — qualquer outro código retorna 404.

## Cenários de mock (rede e falhas)

O cenário ativo fica em `localStorage` (`nft-marketplace.scenario`). No console do navegador:

```js
localStorage.setItem('nft-marketplace.scenario', 'latency') // atraso de 1.2–2.4s no catálogo/carrinho/pedido
localStorage.setItem('nft-marketplace.scenario', 'empty') // catálogo sempre vazio
localStorage.setItem('nft-marketplace.scenario', 'error') // catálogo/carrinho respondem 500
localStorage.setItem('nft-marketplace.scenario', 'declined') // confirmação de compra é sempre recusada (sem afetar o resto)
localStorage.setItem('nft-marketplace.scenario', 'timeout') // POST /api/orders nunca responde (testa timeout + reenvio idempotente)
localStorage.setItem('nft-marketplace.scenario', 'forbidden') // POST /api/favorites responde 403
window.__mocks__.expireSession(userId) // revoga o token atual — simula sessão expirada no meio de um fluxo (ex.: checkout)
window.__mocks__.broadcastRawNftUpdate(event) // emite um nft.updated cru (versão/dados à sua escolha) — testa duplicados/eventos antigos
localStorage.removeItem('nft-marketplace.scenario') // volta ao cenário padrão
```

Recarregue a página após trocar o cenário. Nos testes Playwright, cada teste já começa isolado (o `localStorage` é limpo antes de cada teste — ver `e2e/fixtures.ts` —, o que também reseta o "banco" mockado para os dados seedados).

### Resetar os dados mockados

Os dados (NFTs, favoritos etc.) persistem em `localStorage` (`nft-marketplace.mock-db`) para sobreviver a refresh. Para voltar ao estado inicial seedado:

```js
localStorage.removeItem('nft-marketplace.mock-db')
```

e recarregue a página.

## Testes

```bash
bun run test:e2e
```

Roda a suíte em `e2e/` contra o build de produção (`vite preview`), em Chromium desktop (1440×900), mobile (Pixel 7) e tablet (768×1024 — restrito a `e2e/responsive-tablet.spec.ts`, não duplica a suite inteira).

Regressão visual (`e2e/visual.spec.ts`) usa baselines versionadas em `e2e/visual.spec.ts-snapshots/`; para atualizá-las depois de uma mudança visual intencional: `bunx playwright test e2e/visual.spec.ts --update-snapshots`.

## Autor

Manuel — [LinkedIn](https://www.linkedin.com/in/nuelst/) · [GitHub](https://github.com/nuelst)
