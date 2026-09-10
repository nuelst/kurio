# Auditoria Lighthouse

Início (`/`) e Detalhe do NFT (`/nfts/nft-3`), perfis mobile e desktop, 3 medições por combinação — mediana reportada por categoria. Build de produção (`bun run build`) servido localmente via `vite preview`, cenário padrão dos mocks (Chrome sobe com profile limpo em cada run, sem `scenario` setado em localStorage).

## Ambiente e condições de execução

- Data: 2026-09-10T14:07:20.628Z
- Lighthouse: v13.4.1
- Chrome: Google Chrome 152.0.7977.82
- Node: v24.13.1
- SO: linux 7.0.0-31-generic
- CPU: 11th Gen Intel(R) Core(TM) i5-1155G7 @ 2.50GHz (8 núcleos)
- RAM: 15 GB
- Rede/throttling: perfil padrão do Lighthouse por `formFactor` (mobile → simulated slow 4G; desktop → desktopDense4G), sem throttling adicional.
- Servidor: `vite preview` local (build estático, sem CDN/rede externa).
- Carga do sistema no momento da execução: load average 2.58, 2.09, 2.58 (8 núcleos) — **máquina de desenvolvimento compartilhada, não um runner dedicado/isolado**; havia navegador e IDE abertos e ativos durante a auditoria. Performance (e em menor grau TBT/LCP) é sensível a essa contenção de CPU — variação entre execuções reflete isso, não regressão de código. Accessibility/Best Practices/SEO não dependem de timing e por isso são estáveis entre runs (ver tabela de execuções individuais).

## Resultados (mediana de 3 execuções)

| Página | Perfil | Performance | Accessibility | Best Practices | SEO | LCP | CLS | TBT |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Início | Mobile | 64 | 95 | 100 | 100 | 4911 ms | 0.001 | 501 ms |
| Início | Desktop | 95 | 95 | 100 | 100 | 1444 ms | 0.000 | 58 ms |
| Detalhe do NFT (nft-3) | Mobile | 63 | 100 | 100 | 100 | 5223 ms | 0.000 | 498 ms |
| Detalhe do NFT (nft-3) | Desktop | 81 | 100 | 100 | 100 | 1708 ms | 0.224 | 38 ms |

Metas do enunciado: Performance ≥ 90, Accessibility ≥ 95, Best Practices ≥ 95, SEO ≥ 90.

## Execuções individuais

### Início — Mobile

| Run | Performance | Accessibility | Best Practices | SEO | LCP | CLS | TBT |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 1 | 64 | 95 | 100 | 100 | 4924 ms | 0.001 | 508 ms |
| 2 | 66 | 95 | 100 | 100 | 4605 ms | 0.001 | 501 ms |
| 3 | 64 | 95 | 100 | 100 | 4911 ms | 0.001 | 489 ms |

Relatórios: `lighthouse/reports/inicio-mobile/run-{1,2,3}.{json,html}`

### Início — Desktop

| Run | Performance | Accessibility | Best Practices | SEO | LCP | CLS | TBT |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 1 | 95 | 95 | 100 | 100 | 1444 ms | 0.000 | 61 ms |
| 2 | 95 | 95 | 100 | 100 | 1387 ms | 0.000 | 58 ms |
| 3 | 95 | 95 | 100 | 100 | 1445 ms | 0.000 | 44 ms |

Relatórios: `lighthouse/reports/inicio-desktop/run-{1,2,3}.{json,html}`

### Detalhe do NFT (nft-3) — Mobile

| Run | Performance | Accessibility | Best Practices | SEO | LCP | CLS | TBT |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 1 | 63 | 100 | 100 | 100 | 5223 ms | 0.000 | 498 ms |
| 2 | 66 | 100 | 100 | 100 | 5110 ms | 0.000 | 415 ms |
| 3 | 60 | 100 | 100 | 100 | 5404 ms | 0.000 | 551 ms |

Relatórios: `lighthouse/reports/detalhe-nft-mobile/run-{1,2,3}.{json,html}`

### Detalhe do NFT (nft-3) — Desktop

| Run | Performance | Accessibility | Best Practices | SEO | LCP | CLS | TBT |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 1 | 70 | 100 | 100 | 100 | 2512 ms | 0.224 | 82 ms |
| 2 | 81 | 100 | 100 | 100 | 1708 ms | 0.224 | 38 ms |
| 3 | 82 | 100 | 100 | 100 | 1641 ms | 0.224 | 13 ms |

Relatórios: `lighthouse/reports/detalhe-nft-desktop/run-{1,2,3}.{json,html}`

## CLS — causa identificada

- **Detalhe do NFT (nft-3) / Desktop** — CLS mediano 0.224. Causa (audit `layout-shifts`): Web font loaded (http://localhost:4174/assets/roboto-mono-latin-wght-normal-CZtBPCCa.woff2). A fonte variável (Roboto Mono, `@fontsource-variable/roboto-mono`) usa `font-display: swap` — o texto pinta primeiro com a fonte de fallback do sistema e reflui quando a fonte monoespaçada termina de carregar; como é monoespaçada, a largura de caractere diverge bastante do fallback, então a troca desloca conteúdo abaixo dela (aqui, o footer). Não corrigido nesta rodada: o `font-display` vem do CSS gerado pelo pacote `@fontsource-variable` (não há um jeito robusto de sobrescrever só esse descritor sem reimplementar todos os `@font-face`); a correção correta seria pré-carregar o arquivo `.woff2` específico usado (nome com hash, gerado no build) ou trocar para `font-display: optional`, fora do escopo desta auditoria — fica registrado como próximo passo.

## Abaixo da meta — análise

- **Início / Mobile — performance: 64 (meta 90).**
- **Detalhe do NFT (nft-3) / Mobile — performance: 63 (meta 90).**
- **Detalhe do NFT (nft-3) / Desktop — performance: 81 (meta 90).**

**Performance**: o build de produção inclui a camada de mocks inteira (MSW + `@mswjs/data` + handlers + seed) porque a aplicação não tem backend real — é o que a torna um build estático "de demonstração" funcional. Esse código só interessa ao ambiente de avaliação, mas é indistinguível do resto do bundle de produção: o chunk que carrega o worker do MSW (`browser-*.js`) sozinho soma ~920 KB antes de gzip e precisa terminar de avaliar (incluindo `seedDb()`, que popula ~239 NFTs em `localStorage` na primeira visita) antes de qualquer chamada de API poder ser respondida — isso empurra LCP/TBT/TTI para cima, principalmente no perfil mobile (CPU 4x mais lenta simulada pelo Lighthouse). Não desativei os mocks nem simplifiquei a auditoria para inflar a nota, já que isso descaracterizaria o que está sendo entregue (a instrução da seção 10 do enunciado é explícita sobre isso); em uma aplicação com backend real esse custo não existiria.
