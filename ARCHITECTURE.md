# Arquitetura

## Padrão: MVVM + feature-based

Cada feature em `src/features/<nome>/` separa três camadas:

- **Model** (`model/`) — tipos de domínio e schemas Zod.
- **ViewModel** (`viewmodel/`) — hooks que orquestram TanStack Query, mutations, Zustand e Socket.IO. Não conhecem a rota que os invoca.
- **View** (`ui/`) — componentes de apresentação puros, recebendo o retorno do ViewModel como props.

A rota (`src/routes/`) só lê/escreve o estado da URL, invoca o ViewModel e renderiza a View — nunca contém lógica de negócio.

`src/shared/` reúne o que cruza features: hooks, infraestrutura (`lib`: Axios, Socket.IO, QueryClient, aritmética decimal), stores globais (`stores`: sessão) e UI reaproveitável (`ui`: estados vazio/erro, skeleton com shimmer, paginação). `src/components/ui/` é gerado pelo CLI do shadcn/ui.

## Stack e por que

- **TanStack Router + Vite (SPA)**, não TanStack Start: o desafio pede TanStack Router; SSR não é necessário (mocks são client-side, deploy é estático).
- **shadcn/ui** (preset Nova/Radix), ícones Lucide + alguns SVGs próprios (ver "Identidade visual").
- **Zustand**: sessão (persistida) e estado de UI do modal de auth (efêmero). O carrinho **não** tem store própria — é 100% servidor (mock), via TanStack Query.
- **`@mswjs/data`** para o banco mockado em memória, com `localStorage` para persistir entre refreshes e reset determinístico.
- **`decimal.js`** para toda aritmética em ETH — valores trafegam como string decimal ponta a ponta.
- **Erros tipados**: `shared/lib/http.ts` normaliza erros do Axios em `ApiError { kind, status, message, fieldErrors? }`, registrada como erro padrão do TanStack Query.

## Cache e sincronização (TanStack Query)

Definida em `src/shared/lib/query-client.ts`:

- `staleTime` de 30s, sem refetch automático ao focar a janela — preço/disponibilidade chegam via Socket.IO e escrevem direto no cache.
- Retry automático só para status transitório (5xx/rede), no máximo 2 tentativas; 4xx nunca é re-tentado.
- Mutations nunca são re-tentadas automaticamente — o fluxo de pedido usa idempotência explícita, não retry silencioso.
- A key do catálogo inclui todos os parâmetros de busca — cada combinação de filtros é uma entrada de cache independente, então uma resposta atrasada de uma busca antiga nunca sobrescreve a atual.

## Atualização otimista

`useToggleFavorite` aplica o toggle imediatamente no catálogo e no detalhe (`onMutate`), guarda snapshot e faz rollback exato em `onError` (com toast de erro visível, não silencioso), e invalida ambos em `onSettled`. Mesma mutation usada pelo catálogo, pelo detalhe e por "Mais desta coleção"/relacionados.

## Tempo real (Socket.IO)

- `shared/lib/socket.ts`: singleton preguiçoso; `resetSocket()` derruba a conexão e listeners no logout.
- `shared/lib/realtime-event.ts`: `createEventVersionTracker()` descarta eventos com versão igual ou menor que a já vista — tolera duplicatas e eventos antigos.
- Catálogo e carrinho assinam `nft.updated` e escrevem direto no cache correspondente; alteração relevante no carrinho também dispara toast.
- **Reconciliação pós-reconexão** (`use-socket-reconnect-reconciliation.ts`, montada uma vez em `__root.tsx`): distingue primeira conexão de reconexão real; numa reconexão, invalida catálogo/carrinho/pedido/detalhe de uma vez, cobrindo qualquer atualização perdida enquanto o socket estava caído.
- `order.updated` resolve o pedido (`pending → confirmed/declined`) com o mesmo mecanismo de versão/broadcast; `refetchInterval` condicional serve de fallback caso o socket esteja desconectado.
- **Limitação**: `@mswjs/socket.io-binding` não implementa rooms/namespaces — irrelevante aqui, já que a filtragem por usuário acontece no cliente.

## Mocking (MSW)

- `src/mocks/db.ts`: modelos `@mswjs/data` para todas as entidades do domínio.
- `src/mocks/seed.ts`: seed determinística (239 NFTs, 9 categorias, 2 usuários, 2 cupons), persistida em `localStorage`, versionada (`SEED_VERSION` invalida cenários salvos de uma seed antiga). `resetScenario()` restaura o estado inicial.
- `src/mocks/scenarios/index.ts`: cenário ativo lido do `localStorage` (ver README para a lista).
- `src/mocks/socket/socket-handlers.ts`: Socket.IO mockado via `@mswjs/socket.io-binding` sobre `ws.link('/')`.
- Senhas com hash (SHA-256 + sal fixo), nunca em claro.

## Contratos REST

Toda chamada passa por `shared/lib/http.ts`, que normaliza erros em `ApiError`. `kindFromStatus`: 401→`unauthorized`, 403→`forbidden`, 404→`not_found`, 409→`conflict`, 422→`validation`, ausente/5xx→`transient`.

| Recurso | Endpoint | Request → Response | Erros específicos |
| --- | --- | --- | --- |
| Sessão e conta | `POST /auth/register` | `SignupInput` → `AuthResponse` | 422 validação, 409 e-mail já cadastrado |
| | `POST /auth/login` | `LoginInput` → `AuthResponse` | 401 credenciais inválidas |
| | `POST /auth/logout` | — → `void` | — |
| NFTs | `GET /nfts` | `CatalogSearch` (query) → `CatalogPage` | — |
| | `GET /nfts/:id` | — → `NftDetail` | 404 |
| Favoritos | `GET /favorites` | — → `{ nftId }[]` | — |
| | `POST /favorites` | `{ nftId }` → `void` | 403 (cenário `forbidden`) |
| | `DELETE /favorites/:nftId` | — → `void` | — |
| Carrinho | `GET /cart` | — → `CartQuote` | — |
| | `POST /cart/items` | `{ nftId, quantity }` → `CartQuote` (201) | 404 NFT, 409 edição esgotada |
| | `PATCH /cart/items/:nftId` | `{ quantity }` → `CartQuote` | 404 |
| | `DELETE /cart/items/:nftId` | — → `CartQuote` | — |
| | `POST /cart/coupon` | `{ code }` → `CartQuote` | 404 inválido, 410 expirado |
| | `DELETE /cart/coupon` | — → `CartQuote` | — |
| Pedidos | `POST /orders` | `CreateOrderInput` (com `idempotencyKey`) → `Order` | 409 mesma chave/payload diferente; timeout 2.5s no client |
| | `GET /orders/:orderId` | — → `Order` | 404 |
| Perfil | `GET /profile` | — → `ProfileDetails` | — |
| | `PATCH /profile` | `UpdateProfileInput` → `ProfileDetails` | 422 validação, 409 username/e-mail em uso |
| Carteiras | `GET /wallets` | — → `WalletsResponse` | — |
| | `PUT /wallets/:slot` | `Wallet` → `WalletsResponse` | 422 validação |
| | `DELETE /wallets/:slot` | — → `WalletsResponse` | — |

Não existe endpoint de "consultar sessão": ela sobrevive a refresh via `sessionStore` persistido (`zustand/persist`), não por chamada de rede.

## Sessão e autenticação

- Modal único (`AuthModal`, montado em `__root.tsx`), aberto globalmente via `authModalStore` — qualquer parte do app pode chamar `authModalStore.getState().open('login')`.
- Interceptor global (`shared/lib/http.ts`) expira a sessão em qualquer 401 **exceto** nas próprias tentativas de login/cadastro e **exceto** quando não havia sessão prévia (um 401 anônimo é "isso exige login", não "sessão morreu").
- Login/cadastro: `sessionStore.authenticate()` persiste token+usuário, invalida `['catalog']` (favoritos dependem de quem está logado).
- Logout/troca de usuário: `queryClient.clear()` (não só `invalidateQueries`, que não remove dados sem `userId` na key, como perfil/carteiras) + `resetSocket()`.
- Foco: fechar o modal devolve o foco ao elemento que o abriu (rastreado manualmente, já que o modal não usa `Dialog.Trigger` do Radix).

## Carrinho

- Dono resolvido por `getCartOwnerId`: `userId` do token se autenticado, senão um `X-Guest-Id` gerado e persistido em `localStorage` — permite montar carrinho antes de logar.
- Migração ao autenticar: o handler de login/cadastro move (somando quantidades, respeitando estoque) os itens e o cupom do carrinho de visitante para o do usuário.
- Cotação (`CartQuote`) é sempre recalculada e devolvida inteira pelo mock a cada mutation — o client nunca calcula "no escuro".
- Estoque ao vivo: se a disponibilidade cai abaixo da quantidade guardada, `GET /cart` corrige a linha; se cai a zero, a linha continua visível com `isSoldOut: true` em vez de desaparecer.
- Taxa de rede é uma constante simulada (`0.016 ETH`), cobrada só com item não esgotado no carrinho.

## Pagamento e confirmação de pedido

- `/checkout` e `/orders/:orderId` são rotas próprias (não modais) — o recibo tem URL real e sobrevive a refresh/reabertura de aba.
- Conexão de carteira simula latência (~700ms) e recusa de verdade quando a rede da carteira não é Ethereum.
- `POST /orders` recebe `expectedTotals` e recalcula a cotação server-side; se não bater, responde 409 sem criar o pedido — o client precisa de uma nova confirmação deliberada.
- Idempotência via chave persistida em `sessionStorage` (sobrevive a refresh); reenviar a mesma chave com payload diferente gera 409 (fingerprint da requisição original comparado ao reenvio).
- Pedido nasce `pending` e resolve (`confirmed`/`declined`) ~1.5s depois via `order.updated` (+ polling de fallback) — a resolução é "preguiçosa" (calculada a partir de um timestamp guardado), então sobrevive a reload no meio do processamento sem duplicar.
- Cenário `timeout`: `POST /orders` nunca responde; o client usa timeout de 2.5s e não renova a idempotency key, para o reenvio recuperar o mesmo pedido.
- Recibo é um snapshot congelado no momento da confirmação — mudanças posteriores no catálogo não o alteram. ID de transação e link "Ver no Etherscan" são simulados.
- Expiração de sessão durante o checkout: o modal de login abre por cima da tela atual sem navegar, preservando o formulário e o estado de conexão da carteira.

## Perfil e carteiras

- Rota protegida compartilhada (`_account.tsx`, layout route "pathless"): guard de sessão único em `beforeLoad`, herdado por `/profile` e `/wallets`.
- Avatar: upload real via `FileReader` → data URL, limite de 2MB no client, sem resize/compressão.
- Alterar senha é opcional dentro do mesmo formulário — só valida os três campos se algum for preenchido.
- Carteira principal não pode ser removida pela API (só editada); a secundária pode.

## Testes E2E

- Três viewports (`playwright.config.ts`): desktop (1440×900), mobile (Pixel 7), tablet (768×1024 — só `e2e/responsive-tablet.spec.ts`, via `testMatch`/`testIgnore` cruzados).
- Regressão visual (`e2e/visual.spec.ts`, baselines em `e2e/visual.spec.ts-snapshots/`): só telas estáticas/determinísticas, `animations: 'disabled'`, `maxDiffPixelRatio: 0.02`. Atualizar após mudança visual intencional: `bunx playwright test e2e/visual.spec.ts --update-snapshots`.
- Acessibilidade (`e2e/accessibility.spec.ts`): abre modais por teclado (`focus()` + Enter, não `.click()`), valida focus trap por contagem de elementos focáveis.
- `mocks/dev-tools.ts#broadcastRawNftUpdate` emite eventos "crus" (sem tocar no banco) para testar que o client rejeita duplicados/eventos antigos de verdade.

## Identidade visual (Kurio)

Tokens em `src/styles/globals.css`: fundo `#140D0A`, superfície `#38220F`, texto primário `#F7F3EC`, texto secundário `#CFB28C`, destaque `#D28A4C`, tipografia monoespaçada (Roboto Mono Variable). Marca dark-only, sem variante light.

**Nota sobre fidelidade ao Figma**: o Figma original tinha inconsistências entre telas (botões com paddings/raios diferentes entre si, inputs com alturas e cores variadas, placeholders literais como iniciais de letra em vez de ícones, "carteiras compatíveis" ora como badges separados ora como uma pílula única). Em vez de reproduzir cada divergência literalmente, padronizei um pequeno design system consistente (botão, input, select — altura, padding, raio e cores únicos) e apliquei esse padrão em todas as telas, priorizando coerência visual sobre fidelidade pixel-a-pixel a cada frame individual.

Os ícones de redes sociais (Facebook/Instagram/Twitter/LinkedIn/YouTube) são componentes SVG próprios em `shared/ui/icons.tsx`, no mesmo estilo (stroke) do lucide-react — a lib removeu ícones de marca das versões recentes.

Chrome sem funcionalidade real (busca global do header, filtro por rede, nav Mercado/Criadores/Aprenda, links do footer fora de "Coleções", CTAs promocionais/blog/newsletter, itens fora do escopo do sidebar de conta) mostra um toast "chega em breve" em vez de simular sucesso.

## Desvios e limitações

- **Filtro por rede**: contagens reais do Figma, mas ainda não filtra (modelo de NFT não tem campo de rede).
- **Carteiras/Pagamento — divergência deliberada do Figma**: os frames duplicam campos de identidade do colecionador (nome, e-mail, código de indicação) dentro do formulário de carteira/pagamento. Implementei só os campos que fazem sentido em cada contexto — carteira (apelido, rede, endereço, tipo, ENS) e pagamento (nome, e-mail, ENS, observação) — sem duplicar o que já vive no Perfil.
- **OAuth (Google/Facebook) e "esqueceu a senha"**: visual completo, mas placeholders — OAuth real exigiria um provedor fora do escopo de um mock.
- **Favoritar sem sessão**: reverte o estado otimista silenciosamente em 401, sem mensagem explicando "faça login para favoritar".
- **Cupom expirado após aplicado**: o desconto some silenciosamente na próxima leitura do carrinho (sem toast dedicado); o checkout ainda revalida e pega essa mudança antes de confirmar.
- **Endereço de carteira**: validação genérica (6–64 caracteres), sem regex por rede — a loja aceita Ethereum/Polygon/Solana com formatos de endereço bem diferentes.
- **Avatar sem resize**: só limite de 2MB no client, sem passar por canvas.
- **Checkout compra o carrinho inteiro**: sem seleção parcial de itens na tela de pagamento (o Figma também não mostra isso).
- **Auditoria Lighthouse** (seção 10 do enunciado): `scripts/lighthouse-audit.mjs` builda, sobe `vite preview` local, roda 3 medições de Início e Detalhe do NFT em mobile/desktop, salva HTML/JSON por run e gera `lighthouse/REPORT.md` com mediana, métricas e ambiente de execução (incluindo carga do sistema — máquina de desenvolvimento compartilhada, não um runner isolado). Comando: `bun run lighthouse`.
  - Accessibility, Best Practices e SEO batem a meta em todas as combinações. Performance mobile fica abaixo da meta — causa identificada e documentada no próprio `REPORT.md`: o build de produção inclui a camada de mocks inteira (MSW + `@mswjs/data`) porque não há backend real, o que empurra LCP/TBT para cima especialmente sob o CPU throttling do perfil mobile. Não desativei os mocks para inflar a nota — a seção 10 exige que a auditoria carregue as funcionalidades reais da entrega.
