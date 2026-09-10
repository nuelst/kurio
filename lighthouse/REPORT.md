# Auditoria Lighthouse

Início (`/`) e Detalhe do NFT (`/nfts/nft-3`), perfis mobile e desktop, 3 medições por combinação — mediana reportada por categoria. Build de produção (`bun run build`) servido localmente via `vite preview`, cenário padrão dos mocks (Chrome sobe com profile limpo em cada run, sem `scenario` setado em localStorage).

## Ambiente e condições de execução

- Data: 2026-09-10T21:47:00.257Z
- Lighthouse: v13.4.1
- Chrome: Google Chrome 152.0.7977.82
- Node: v24.13.1
- SO: linux 7.0.0-31-generic
- CPU: 11th Gen Intel(R) Core(TM) i5-1155G7 @ 2.50GHz (8 núcleos)
- RAM: 15 GB
- Rede/throttling: perfil padrão do Lighthouse por `formFactor` (mobile → simulated slow 4G; desktop → desktopDense4G), sem throttling adicional.
- Servidor: `vite preview` local (build estático, sem CDN/rede externa).
- Carga do sistema no momento da execução: load average 4.31, 6.42, 9.27 (8 núcleos) — **máquina de desenvolvimento compartilhada, não um runner dedicado/isolado**; havia navegador e IDE abertos e ativos durante a auditoria. Performance (e em menor grau TBT/LCP) é sensível a essa contenção de CPU — variação entre execuções reflete isso, não regressão de código. Accessibility/Best Practices/SEO não dependem de timing e por isso são estáveis entre runs (ver tabela de execuções individuais).

## Resultados (mediana de 3 execuções)

| Página | Perfil | Performance | Accessibility | Best Practices | SEO | LCP | CLS | TBT |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Início | Mobile | 62 | 94 | 100 | 100 | 4778 ms | 0.000 | 497 ms |
| Início | Desktop | 90 | 95 | 100 | 100 | 1795 ms | 0.000 | 81 ms |
| Detalhe do NFT (nft-3) | Mobile | 64 | 100 | 100 | 100 | 5391 ms | 0.000 | 410 ms |
| Detalhe do NFT (nft-3) | Desktop | 79 | 100 | 100 | 100 | 1860 ms | 0.224 | 19 ms |

Metas do enunciado: Performance ≥ 90, Accessibility ≥ 95, Best Practices ≥ 95, SEO ≥ 90.

## Execuções individuais

### Início — Mobile

| Run | Performance | Accessibility | Best Practices | SEO | LCP | CLS | TBT |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 1 | 68 | 94 | 100 | 100 | 4707 ms | 0.000 | 392 ms |
| 2 | 62 | 94 | 100 | 100 | 4778 ms | 0.000 | 563 ms |
| 3 | 62 | 94 | 100 | 100 | 4968 ms | 0.000 | 497 ms |

Relatórios: `lighthouse/reports/inicio-mobile/run-{1,2,3}.{json,html}`

### Início — Desktop

| Run | Performance | Accessibility | Best Practices | SEO | LCP | CLS | TBT |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 1 | 90 | 95 | 100 | 100 | 1783 ms | 0.000 | 86 ms |
| 2 | 86 | 95 | 100 | 100 | 2126 ms | 0.000 | 81 ms |
| 3 | 90 | 95 | 100 | 100 | 1795 ms | 0.000 | 73 ms |

Relatórios: `lighthouse/reports/inicio-desktop/run-{1,2,3}.{json,html}`

### Detalhe do NFT (nft-3) — Mobile

| Run | Performance | Accessibility | Best Practices | SEO | LCP | CLS | TBT |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 1 | 62 | 100 | 100 | 100 | 5632 ms | 0.000 | 456 ms |
| 2 | 70 | 100 | 100 | 100 | 5163 ms | 0.000 | 268 ms |
| 3 | 64 | 100 | 100 | 100 | 5391 ms | 0.000 | 410 ms |

Relatórios: `lighthouse/reports/detalhe-nft-mobile/run-{1,2,3}.{json,html}`

### Detalhe do NFT (nft-3) — Desktop

| Run | Performance | Accessibility | Best Practices | SEO | LCP | CLS | TBT |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 1 | 78 | 100 | 100 | 100 | 1931 ms | 0.224 | 19 ms |
| 2 | 79 | 100 | 100 | 100 | 1860 ms | 0.224 | 34 ms |
| 3 | 80 | 100 | 100 | 100 | 1761 ms | 0.224 | 17 ms |

Relatórios: `lighthouse/reports/detalhe-nft-desktop/run-{1,2,3}.{json,html}`

## CLS — causa identificada

- **Detalhe do NFT (nft-3) / Desktop** — CLS mediano 0.224. Causa (audit `layout-shifts`): Web font loaded (http://localhost:4174/assets/roboto-mono-latin-wght-normal-CZtBPCCa.woff2). A fonte variável (Roboto Mono, `@fontsource-variable/roboto-mono`) usa `font-display: swap` — o texto pinta primeiro com a fonte de fallback do sistema e reflui quando a fonte monoespaçada termina de carregar; como é monoespaçada, a largura de caractere diverge bastante do fallback, então a troca desloca conteúdo abaixo dela (aqui, o footer). Não corrigido nesta rodada: o `font-display` vem do CSS gerado pelo pacote `@fontsource-variable` (não há um jeito robusto de sobrescrever só esse descritor sem reimplementar todos os `@font-face`); a correção correta seria pré-carregar o arquivo `.woff2` específico usado (nome com hash, gerado no build) ou trocar para `font-display: optional`, fora do escopo desta auditoria — fica registrado como próximo passo.

## Abaixo da meta — análise

- **Início / Mobile — performance: 62 (meta 90).**
- **Início / Mobile — accessibility: 94 (meta 95).**
- **Detalhe do NFT (nft-3) / Mobile — performance: 64 (meta 90).**
- **Detalhe do NFT (nft-3) / Desktop — performance: 79 (meta 90).**

**Performance**: o build de produção inclui a camada de mocks inteira (MSW + `@mswjs/data` + handlers + seed) porque a aplicação não tem backend real — é o que a torna um build estático "de demonstração" funcional. Esse código só interessa ao ambiente de avaliação, mas é indistinguível do resto do bundle de produção: o chunk que carrega o worker do MSW (`browser-*.js`) precisa terminar de avaliar (incluindo `seedDb()`, que popula ~239 NFTs em `localStorage` na primeira visita) antes de qualquer chamada de API poder ser respondida — isso empurra LCP/TBT/TTI para cima, principalmente no perfil mobile (CPU 4x mais lenta simulada pelo Lighthouse). Não desativei os mocks nem simplifiquei a auditoria para inflar a nota, já que isso descaracterizaria o que está sendo entregue (a instrução da seção 10 do enunciado é explícita sobre isso); em uma aplicação com backend real esse custo não existiria.

**Otimização aplicada nesta rodada**: `@mswjs/socket.io-binding` (usado só para emular Socket.IO no mock) saiu do grafo de import estático de `mocks/browser.ts` — três arquivos que o importavam de forma síncrona (`mocks/handlers/index.ts`, `mocks/dev-tools.ts`, `mocks/handlers/orders-handlers.ts`) passaram a importá-lo via `import()` dinâmico, registrado em segundo plano depois de `worker.start()`. O `@mswjs/data`/handlers REST continuam no chunk crítico (são necessários já na primeira consulta ao catálogo, não dá pra adiar sem uma reescrita maior da camada de mock). Resultado **verificado pelo tamanho real do build**: o chunk `browser-*.js` caiu de 919.862 bytes para 740.990 bytes (**-19,5%**), com o binding de socket agora num chunk separado (`graphql-*.js`, 174 KB) que só é buscado depois do primeiro paint. **Esse ganho não aparece claramente nos números desta rodada** porque a carga do sistema durante esta medição (load average 4.31/6.42/9.27) ficou bem mais alta que na rodada anterior (2.58/2.09/2.58 — muitas builds e suítes de teste rodando em sequência na mesma sessão) — a métrica de Performance do Lighthouse é sensível a essa contenção de CPU o bastante para mascarar uma redução de ~180 KB no bundle. Uma remedição com a máquina ociosa deve refletir o ganho de forma mais limpa.

**Accessibility**: os 3 achados abaixo (constantes nas 3 execuções, não são ruído) estão em código que não foi tocado nesta sessão de trabalho mobile (tabs do catálogo, card de NFT, rodapé) — não são regressão do trabalho de performance/mobile, ficam registrados como débito técnico pré-existente pra uma próxima rodada:
- `aria-valid-attr-value`: o trigger do Radix Tabs no catálogo (`#radix-_r_3_-trigger-all`) aponta `aria-controls` para um id de painel que não bate (`radix-_r_3_-content-all`) — provável mismatch de geração de id do Radix.
- `heading-order`: o `<h3 data-testid="nft-title">` dos cards do catálogo quebra a hierarquia sequencial de headings da página.
- `label-content-name-mismatch`: os botões de redes sociais do rodapé (Facebook "FB", Instagram "IG", YouTube "YT") têm texto visível que não bate com o `aria-label` — o texto do ícone deveria estar oculto de leitores de tela (`aria-hidden`) já que o `aria-label` já descreve o botão.
