# NFT Marketplace

Solução em desenvolvimento para o [desafio frontend](CHALLENGE.md) de um marketplace de NFTs. O enunciado original do desafio foi preservado em [CHALLENGE.md](CHALLENGE.md).

## Status atual

Esta é a primeira fatia entregue: as **9 telas do enunciado estão todas implementadas** — Início/Catálogo, Detalhe do NFT, Carrinho, Login, Cadastro, Perfil do colecionador, Carteiras, Pagamento e Confirmação de pedido — seguindo o padrão arquitetural descrito em [ARCHITECTURE.md](ARCHITECTURE.md). Itens fora do escopo listado (perfil editorial completo, atividade, ofertas etc.) ficam como chrome visual com placeholder, documentado abaixo.

Implementado até aqui:

- Identidade visual da Kurio aplicada por completo na Início (cores, tipografia mono, container de 1200px — veja [ARCHITECTURE.md](ARCHITECTURE.md#identidade-visual-kurio)): header, hero, catálogo, cards promocionais, blog "Diário da Cunhagem", newsletter e footer.
- Catálogo com busca, filtro por coleção/categoria (com contagens reais), faixa de preço, ordenação e paginação — tudo refletido na URL, sobrevivendo a refresh e à navegação pelo histórico (voltar/avançar).
- **Detalhe do NFT**: galeria com zoom, edição/quantidade (respeitando o estoque), favoritar, compartilhar (LinkedIn/e-mail/Twitter reais), abas de detalhes/avaliações, "mais desta coleção" scrollável, acesso direto e tratamento de NFT inexistente — veja [ARCHITECTURE.md](ARCHITECTURE.md#detalhe-do-nft).
- **Carrinho**: adicionar via "Comprar" no detalhe, editar quantidade e remover item (respeitando estoque), aplicar/remover cupom promocional (com tratamento de código inválido/expirado), subtotal/desconto/taxa/total sempre vindos da API, carrinho de visitante que migra para o usuário ao autenticar, persistência após refresh e atualização de preço/disponibilidade em tempo real via Socket.IO — veja [ARCHITECTURE.md](ARCHITECTURE.md#carrinho).
- Favoritar/desfavoritar com atualização otimista e rollback em falha (catálogo e detalhe compartilham o mesmo cache).
- **Login e cadastro reais** via modal (validação client-side com Zod, tratamento de conflito de e-mail e credenciais inválidas do lado do mock, sessão persistida, logout limpa cache/sockets — veja [ARCHITECTURE.md](ARCHITECTURE.md#autenticação)).
- **Perfil do colecionador**: edição de nome/usuário/e-mail/ENS, upload real de avatar (com remoção), alteração de senha (opcional, com revalidação da senha atual no mock) — tudo sincronizado de volta com a sessão/header ao salvar. Acesso exige login (redireciona e abre o modal) — veja [ARCHITECTURE.md](ARCHITECTURE.md#perfil-e-carteiras).
- **Carteiras**: cadastro/edição de carteira principal e secundária (apelido, rede, endereço, tipo — MetaMask/WalletConnect/Coinbase —, ENS opcional), atalho para copiar os dados da principal na secundária, remoção da secundária — veja [ARCHITECTURE.md](ARCHITECTURE.md#perfil-e-carteiras).
- **Pagamento**: revisão/edição dos dados do colecionador (pré-preenchidos do perfil), seleção entre as carteiras cadastradas com simulação real de conexão/recusa/desconexão (recusa de verdade quando a carteira está numa rede diferente de Ethereum), revalidação da cotação no servidor antes de confirmar (rejeita com 409 se algo mudou), idempotência que sobrevive a refresh e expiração de sessão simulável *durante* o preenchimento — o login reabre por cima da tela sem perder o formulário — veja [ARCHITECTURE.md](ARCHITECTURE.md#pagamento-e-confirmação-de-pedido).
- **Confirmação de pedido, assíncrona de verdade**: o pedido nasce `pending` e resolve (`confirmed`/`declined`) ~1.5s depois via `order.updated` no Socket.IO (com polling de fallback) — sobrevive a reload no meio do processamento sem duplicar a compra. Recibo em `/orders/:id` com ID de transação, itens, taxas e total, um snapshot congelado no momento da confirmação (mudanças depois no catálogo não afetam o recibo), com link simulado "Ver no Etherscan". Pedidos recusados mostram uma tela distinta sem mexer no carrinho — veja [ARCHITECTURE.md](ARCHITECTURE.md#pagamento-e-confirmação-de-pedido).
- **Tempo real**: atualização de preço/disponibilidade via Socket.IO (evento `nft.updated`) refletida no catálogo, no carrinho e no pagamento — inclusive quando o próprio estoque cai por causa de uma compra confirmada em outra aba/usuário; e reconciliação automática pós-reconexão do socket (refetch dos recursos ativos ao reconectar, cobrindo qualquer atualização perdida enquanto desconectado) — veja [ARCHITECTURE.md](ARCHITECTURE.md#tempo-real-socketio).
- Camada de mocks com MSW + `@mswjs/data`, com cenários de rede configuráveis (latência, vazio, erro, pedido recusado, timeout na criação do pedido), usando os 4 artworks de NFT fornecidos.
- Suíte de testes E2E (Playwright): catálogo, autenticação, detalhe do NFT, carrinho, perfil, carteiras, pagamento (fluxo completo, recusa de rede, pedido recusado, sem carteira cadastrada, cotação desatualizada, idempotência, timeout com recuperação), confirmação de pedido (recibo, recuperação após refresh, imutabilidade, pedido pendente resolvendo ao vivo) e tempo real (reconexão do socket, reconciliação), rodando em viewport desktop e mobile.
- **Auditoria Lighthouse**: Início e Detalhe do NFT, mobile e desktop, 3 medições por combinação com mediana reportada — `bun run lighthouse`. Relatório em [lighthouse/REPORT.md](lighthouse/REPORT.md) (ambiente, resultados, causas de qualquer categoria abaixo da meta), relatórios HTML/JSON individuais em `lighthouse/reports/` — veja [ARCHITECTURE.md](ARCHITECTURE.md#desvios-e-limitações).

Chrome visível mas ainda sem função real (busca global, nav secundária, filtro por rede, links do footer, OAuth/recuperação de senha, itens fora do escopo do sidebar de conta) mostra um toast "chega em breve" ao ser clicado — veja [ARCHITECTURE.md](ARCHITECTURE.md#identidade-visual-kurio).

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
| `bun run test:e2e`                | Testes Playwright (builda, sobe o preview e executa Chromium desktop + mobile).       |
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
window.__mocks__.expireSession(userId) // revoga o token atual — simula sessão expirada no meio de um fluxo (ex.: checkout)
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

Roda a suíte em `e2e/` contra o build de produção (`vite preview`), em Chromium desktop (1440×900) e mobile (Pixel 7).
