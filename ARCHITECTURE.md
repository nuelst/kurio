# Arquitetura

## Padrão: MVVM + feature-based

Cada feature em `src/features/<nome>/` separa três camadas:

- **Model** (`model/`) — tipos de domínio e schemas Zod. Não importa React.
- **ViewModel** (`viewmodel/`) — hooks que orquestram TanStack Query, mutations, Zustand e Socket.IO. Recebem/retornam dados simples, nunca JSX, e não conhecem a rota que os invoca (o roteamento é injetado via parâmetros, ex. `search`/`onSearchChange` em `useCatalogViewModel`).
- **View** (`ui/`) — componentes de apresentação puros, recebendo o retorno do ViewModel como props.

A camada de rota (`src/routes/`) é o ponto de encontro: um arquivo de rota fino lê/escreve o estado da URL, invoca o ViewModel e renderiza a View correspondente — nunca contém lógica de negócio.

`src/shared/` reúne o que é usado por mais de uma feature: hooks (`shared/hooks`), infraestrutura (`shared/lib`: Axios, cliente Socket.IO, QueryClient, aritmética decimal), stores globais (`shared/stores`: sessão) e componentes de UI reaproveitáveis (`shared/ui`: estados vazio/erro, skeleton com shimmer, paginação).

`src/components/ui/` é gerenciado pelo CLI do shadcn/ui (primitivas: Button, Input, Select, Card...) e não deve ser editado manualmente além do necessário para adequar ao design.

## Stack e por que

- **TanStack Router + Vite (SPA)**, não TanStack Start: o desafio pede TanStack Router especificamente; SSR/server functions adicionariam complexidade sem necessidade (MSW é client-side, o deploy é estático).
- **shadcn/ui, preset Nova (base Radix)**: preset padrão do CLI atual, ícones Lucide, fonte Geist Variable.
- **`cn` (pacote oficial shadcn-ui/cn)** substitui `clsx` + `tailwind-merge` diretamente — já é o que os componentes gerados usam.
- **Zustand**: sessão (`shared/stores/session-store.ts`, persistida) e estado de UI do modal de auth (`features/auth/stores/auth-modal-store.ts`, efêmero); o carrinho ganha sua própria store quando a feature for implementada.
- **`@mswjs/data`** para o "banco" mockado em memória (`src/mocks/db.ts`), com `localStorage` para persistir entre refreshes e uma função de reset determinístico (`resetScenario`).
- **`decimal.js`** (`shared/lib/money.ts`) para toda aritmética em ETH — valores trafegam como string decimal ponta a ponta (API mock → cache → UI) para não perder precisão.
- **Erros tipados**: `shared/lib/http.ts` normaliza qualquer erro do Axios em uma classe `ApiError` (com `kind`: `validation` | `unauthorized` | `forbidden` | `not_found` | `conflict` | `transient` | `unknown`), registrada como o tipo de erro padrão do TanStack Query via `declare module '@tanstack/react-query' { interface Register { defaultError: ApiError } }`.

## Política de cache (TanStack Query)

Definida em `src/shared/lib/query-client.ts`:

- Queries: `staleTime` de 30s, sem refetch automático ao focar a janela — atualizações de preço/disponibilidade chegam via Socket.IO e escrevem direto no cache (`queryClient.setQueriesData`), então polling entraria em conflito com esses patches.
- Retry automático apenas para status transitório (5xx ou falha de rede), no máximo 2 tentativas; erros 4xx nunca são re-tentados automaticamente.
- Mutations nunca são re-tentadas automaticamente — o fluxo de pedido usa idempotência explícita (`shared/hooks/use-idempotency-key.ts`), não retry silencioso, para nunca duplicar uma compra.
- Chave de query do catálogo inclui todos os parâmetros de busca (`['catalog', 'list', search]`): cada combinação de filtros é uma entrada de cache independente, então uma resposta atrasada de uma busca antiga nunca sobrescreve o resultado da busca atual — resolve "respostas fora de ordem" sem lógica adicional.

## Atualização otimista

`useToggleFavorite` (`src/features/favorites/viewmodel/use-toggle-favorite.ts`) aplica o toggle imediatamente em todas as páginas de catálogo em cache **e** no cache de `['nft-detail', id]` se estiver carregado (`onMutate`), guarda os snapshots anteriores e faz rollback exato em `onError`. Ao final (`onSettled`), invalida ambos para reconciliar com o servidor. É a mesma mutation usada pelo catálogo, pelo detalhe e pelos cards de "Mais desta coleção" — um único lugar de verdade para favoritar.

## Tempo real (Socket.IO)

- `shared/lib/socket.ts`: singleton preguiçoso; `resetSocket()` derruba a conexão e remove todos os listeners — chamado no logout (`features/auth/viewmodel/use-logout.ts`) para nunca deixar uma subscription da sessão anterior viva.
- `shared/lib/realtime-event.ts`: `createEventVersionTracker()` guarda a maior versão vista por id de recurso e descarta eventos com versão igual ou menor — tolera duplicatas e eventos antigos sem regredir estado mais novo (`nft.updated` carrega `id`, `resource`, `version`).
- Reconciliação pós-reconexão (ex.: refetch REST ao reconectar) fica a cargo de cada feature ativa; para o catálogo, a própria invalidação/patch de cache cobre isso — outras features (pedido pendente) vão precisar de lógica própria quando implementadas.

## Mocks (MSW)

- `src/mocks/db.ts`: modelos `@mswjs/data` para todas as entidades do domínio (usuário, NFT, edição, favorito, item de carrinho, cupom, pedido, carteira) — mesmo que só catálogo/favoritos/detalhe tenham handlers REST nesta fatia, o esquema já existe para as próximas features não precisarem remodelar o banco.
- `src/mocks/handlers/nft-mapper.ts`: converte um par `(nft, edition)` do banco no `NftSummary` da API — usado pelo handler de listagem e pelo de detalhe, para as duas rotas nunca divergirem na forma do objeto.
- `src/mocks/seed.ts`: seed determinística (239 NFTs em 9 categorias, contagens batendo com o Figma; 2 usuários) com persistência em `localStorage`; `resetScenario()` limpa e reseeda. Versionada (`SEED_VERSION`): mudar a seed invalida automaticamente qualquer cenário salvo em um navegador antigo, em vez de deixar dados desatualizados presos no `localStorage` de quem já tinha aberto o app antes.
- `src/mocks/scenarios/index.ts`: cenário ativo (`default` | `empty` | `latency` | `error`) lido pelos handlers a partir do `localStorage` — documentado no README.
- `src/mocks/socket/socket-handlers.ts`: usa `@mswjs/socket.io-binding` sobre `ws.link('*/socket.io/*')` (os wildcards absorvem o path/query que o protocolo Engine.IO do Socket.IO negocia). Guarda os clientes conectados para permitir broadcast de `nft.updated` a partir de qualquer handler/cenário futuro. **Limitação**: o binding não implementa rooms/namespaces do Socket.IO — irrelevante aqui pois cada usuário só recebe eventos dos seus próprios recursos ativos, filtrados no cliente.
- Autenticação mockada (`src/mocks/auth.ts`) usa um esquema provisório de token (`token-<userId>`) emitido no login/cadastro; senhas são guardadas com hash (SHA-256 + sal fixo via `crypto.subtle`, síncrono o bastante para um mock — nunca em claro).

## Autenticação

- `src/features/auth/`: `model` (schemas Zod de login/cadastro + tipos de resposta), `api` (chamadas Axios), `viewmodel` (`useLoginForm`/`useSignupForm` com React Hook Form + Zod, `useLogout`), `ui` (`AuthModal`, `LoginForm`, `SignupForm`), `stores` (`authModalStore`, um Zustand só de UI — aberto/fechado + modo — separado do `sessionStore` em `shared/stores`, que guarda a identidade).
- O modal é montado uma única vez em `src/routes/__root.tsx` e controlado globalmente pelo `authModalStore`; o header só chama `authModalStore.getState().open('login')` — qualquer lugar do app pode abrir o modal sem precisar renderizá-lo localmente.
- Erros do mock: 422 (campos inválidos, tratado majoritariamente no client via Zod antes de bater na API), 409 no cadastro (e-mail já cadastrado, mapeado para o campo `email` via `form.setError`), 401 no login (credenciais inválidas, mensagem genérica de propósito — não revela se o e-mail existe).
- **Cuidado com o interceptor 401**: `shared/lib/http.ts` expira a sessão global (`sessionStore.getState().expire()`) em qualquer 401 — exceto nas próprias tentativas de `/auth/login` e `/auth/register`, que usam 401/409 para "essa tentativa falhou", não "sua sessão caducou". Sem essa exclusão, uma senha errada digitada por um usuário já logado derrubaria a sessão dele por engano.
- Login/cadastro bem-sucedidos: `sessionStore.authenticate()` grava token+usuário (persistido via `zustand/persist`), invalida `['catalog']` (favoritos dependem de quem está logado) e fecha o modal — não há redirect, então "retornar ao fluxo anterior" (seção 3 do enunciado) é automático, já que a modal só sobrepõe a página atual.
- Logout (`useLogout`): chama `/auth/logout` (best-effort), limpa `sessionStore`, roda `resetSocket()` e invalida `['catalog']` — mesma lógica de "trocar de usuário", já que um novo login é só outro `authenticate()` por cima.

## Detalhe do NFT

- `src/features/nft-detail/`: mesma separação model/api/viewmodel/ui. `NftDetail` estende o `NftSummary` do catálogo (mesma imagem/preço/disponibilidade que o card mostrou, sem re-buscar o que já se sabia) com galeria, atributos, coleção, rede/contrato/royalty e avaliações.
- Rota `src/routes/nfts.$nftId.tsx`: o componente da rota renderiza `<NftDetailPage key={nftId} .../>` — trocar de NFT (ex.: pelo "Mais desta coleção") muda a `key`, o React remonta a subárvore e o estado local (imagem selecionada, quantidade, aba ativa) reseta de graça, sem precisar de um `useEffect` só para isso.
- **Galeria**: como só temos 4 artes fornecidas (não 4 fotos por NFT), a miniatura principal é sempre a mesma imagem do card que o usuário clicou — consistência entre catálogo e detalhe — e as outras 3 miniaturas ciclam pelas artes restantes como "ângulos" ilustrativos. Zoom abre a imagem ampliada num Dialog.
- **Quantidade e estoque**: a quantidade é clampada em `[1, available]` no próprio handler `+`/`-` (nunca só no submit) e o botão "Comprar" vira "Esgotado" e desabilita quando `available === 0` — cobre os requisitos de "limite de quantidade" e "edição indisponível" da seção 3 do enunciado sem precisar de uma tela de erro separada.
- **Atributos, avaliações e ID do token** são derivados deterministicamente do id do NFT no handler de mock (mesmo princípio dos preços/disponibilidade do catálogo: dado simulado, não aleatório) — nunca fica em branco, nunca muda entre reloads.
- **Compartilhar** é funcional de verdade: LinkedIn/Twitter abrem a URL de share-intent oficial de cada rede numa nova aba; e-mail usa `mailto:`. Nenhuma chave de API é necessária para isso.
- **"Mais desta coleção"** reaproveita `catalogQueries.list({ category })` (a mesma query do catálogo) filtrando o próprio NFT fora da lista — nenhum endpoint novo só para "relacionados". Os cards são o mesmíssimo `NftCard` do catálogo, só que numa linha com `overflow-x-auto` em vez de grid.
- **404 tratado de verdade**: acessar `/nfts/<id-inexistente>` direto (sem passar pelo catálogo) retorna 404 do mock e renderiza um estado "NFT não encontrado" com link de volta — não um crash nem uma tela em branco (seção 4 do enunciado: "tratamento de rotas inexistentes e acesso direto a qualquer tela prevista").

## Identidade visual (Kurio)

Tokens extraídos de `figma/Início.png` e `design-ui.md`: fundo `#140D0A`, superfície `#38220F`, texto primário `#F7F3EC`, texto secundário `#CFB28C`, destaque `#D28A4C`, tipografia monoespaçada (Roboto Mono Variable, confirmada em `design-ui.md`) em toda a interface, container central de 1200px (`max-w-page`). A marca é dark-only — não há variante light no Figma, então a paleta é definida uma única vez em `:root` (`src/styles/globals.css`), sem alternância de tema.

Os 4 artworks de NFT fornecidos (`figma/nft-0{1..4}.png`) foram copiados para `src/assets/nft/` e são usados nos dados seedados (`src/mocks/seed.ts`), ciclando entre os 4 independentemente da categoria — mesmo padrão do Figma, que reaproveita as mesmas ilustrações em NFTs com nomes diferentes.

Chrome ainda sem funcionalidade real (busca global do header, carrinho, login, filtro por rede, itens de navegação Mercado/Criadores/Aprenda, links do footer fora de "Coleções", CTAs dos cards promocionais/blog/newsletter) mostra um toast "chega em breve" ao ser clicado (`shared/lib/not-implemented.ts`) em vez de simular sucesso — mantém a fidelidade visual sem fingir um fluxo que ainda não existe. O link "Coleções" do footer é real (navega e aplica o filtro de categoria correspondente).

Todas as seções da Início do Figma foram portadas: header, hero, catálogo (sidebar + grid + paginação), banner "NFT em destaque", cards promocionais, blog "Diário da Cunhagem" e footer (newsletter/destaques + contato + colunas de links + copyright, como 4 faixas de uma peça só — ver `footer-ui.md`).

Os ícones de redes sociais do lucide-react (Facebook/Instagram/Twitter/LinkedIn/YouTube) foram removidos das versões recentes da lib; o footer usa badges com a sigla de cada rede (FB/IG/X/in/YT) em vez de desenhar os logos de marca à mão.

## Desvios e limitações

- **Filtro por rede**: exibido com contagens reais do Figma, mas ainda não filtra (nosso modelo de NFT não tem campo de rede); vira funcional se/quando isso for modelado.
- **Lighthouse CI**: dependência instalada (`lighthouse`, `@lhci/cli`), mas a configuração versionada (`lighthouserc`) ainda não foi criada — entra com a fatia de performance.
- **OAuth (Google/Facebook) e "esqueceu a senha"**: os botões existem com o visual completo, mas são placeholders (`notImplementedToast`) — implementar OAuth de verdade exigiria um provedor real, fora do escopo de um mock.
- **Expiração de sessão**: a infraestrutura existe (`sessionStore.expire()`, interceptor 401), mas nada hoje gera uma expiração artificial durante a navegação/checkout como pede a seção 4 do enunciado — fica para quando o checkout for implementado.
- **Botão "Comprar" no detalhe**: mostra um toast "chega em breve" — o fluxo real (carrinho → checkout → revalidação de preço/estoque → confirmação) ainda não existe. Favoritar e a quantidade já são reais; só a compra em si é placeholder.
- **Favoritar sem sessão**: hoje só reverte o estado otimista silenciosamente quando a API responde 401 (sem mensagem explicando "faça login para favoritar") — o mesmo comportamento já existia no catálogo antes desta fatia; ficou por cobrir/melhorar quando o fluxo de auth-gating for revisitado.
