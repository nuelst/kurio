# Auditoria Lighthouse

Início (`/`) e Detalhe do NFT (`/nfts/nft-3`), perfis mobile e desktop, 3 medições por combinação — mediana reportada por categoria. Build de produção (`bun run build`) servido localmente via `vite preview`, cenário padrão dos mocks (Chrome sobe com profile limpo em cada run, sem `scenario` setado em localStorage).

## Ambiente e condições de execução

- Data: 2026-09-10T23:07:21.970Z
- Lighthouse: v13.4.1
- Chrome: Google Chrome 152.0.7977.82
- Node: v24.13.1
- SO: linux 7.0.0-31-generic
- CPU: 11th Gen Intel(R) Core(TM) i5-1155G7 @ 2.50GHz (8 núcleos)
- RAM: 15 GB
- Rede/throttling: perfil padrão do Lighthouse por `formFactor` (mobile → simulated slow 4G; desktop → desktopDense4G), sem throttling adicional.
- Servidor: `vite preview` local (build estático, sem CDN/rede externa).
- Carga do sistema no momento da execução: load average 2.47, 2.55, 3.65 (8 núcleos) — **máquina de desenvolvimento compartilhada, não um runner dedicado/isolado**; havia navegador e IDE abertos e ativos durante a auditoria. Performance (e em menor grau TBT/LCP) é sensível a essa contenção de CPU — variação entre execuções reflete isso, não regressão de código. Accessibility/Best Practices/SEO não dependem de timing e por isso são estáveis entre runs (ver tabela de execuções individuais).

## Resultados (mediana de 3 execuções)

| Página | Perfil | Performance | Accessibility | Best Practices | SEO | LCP | CLS | TBT |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Início | Mobile | 56 | 100 | 100 | 100 | 4844 ms | 0.000 | 841 ms |
| Início | Desktop | 92 | 100 | 100 | 100 | 1611 ms | 0.000 | 56 ms |
| Detalhe do NFT (nft-3) | Mobile | 59 | 100 | 100 | 100 | 5820 ms | 0.000 | 540 ms |
| Detalhe do NFT (nft-3) | Desktop | 92 | 100 | 100 | 100 | 1717 ms | 0.000 | 23 ms |

Metas do enunciado: Performance ≥ 90, Accessibility ≥ 95, Best Practices ≥ 95, SEO ≥ 90.

## Execuções individuais

### Início — Mobile

| Run | Performance | Accessibility | Best Practices | SEO | LCP | CLS | TBT |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 1 | 67 | 100 | 100 | 100 | 4793 ms | 0.000 | 413 ms |
| 2 | 54 | 100 | 100 | 100 | 4859 ms | 0.000 | 996 ms |
| 3 | 56 | 100 | 100 | 100 | 4844 ms | 0.000 | 841 ms |

Relatórios: `lighthouse/reports/inicio-mobile/run-{1,2,3}.{json,html}`

### Início — Desktop

| Run | Performance | Accessibility | Best Practices | SEO | LCP | CLS | TBT |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 1 | 93 | 100 | 100 | 100 | 1580 ms | 0.000 | 56 ms |
| 2 | 91 | 100 | 100 | 100 | 1653 ms | 0.000 | 110 ms |
| 3 | 92 | 100 | 100 | 100 | 1611 ms | 0.000 | 40 ms |

Relatórios: `lighthouse/reports/inicio-desktop/run-{1,2,3}.{json,html}`

### Detalhe do NFT (nft-3) — Mobile

| Run | Performance | Accessibility | Best Practices | SEO | LCP | CLS | TBT |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 1 | 59 | 100 | 100 | 100 | 5820 ms | 0.000 | 524 ms |
| 2 | 58 | 100 | 100 | 100 | 5944 ms | 0.000 | 540 ms |
| 3 | 59 | 100 | 100 | 100 | 5630 ms | 0.000 | 540 ms |

Relatórios: `lighthouse/reports/detalhe-nft-mobile/run-{1,2,3}.{json,html}`

### Detalhe do NFT (nft-3) — Desktop

| Run | Performance | Accessibility | Best Practices | SEO | LCP | CLS | TBT |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 1 | 92 | 100 | 100 | 100 | 1717 ms | 0.000 | 23 ms |
| 2 | 91 | 100 | 100 | 100 | 1814 ms | 0.000 | 25 ms |
| 3 | 92 | 100 | 100 | 100 | 1680 ms | 0.000 | 22 ms |

Relatórios: `lighthouse/reports/detalhe-nft-desktop/run-{1,2,3}.{json,html}`

## CLS — causa identificada

CLS mediano ficou ≤ 0.1 (bom, por classificação do Core Web Vitals) em todas as combinações.

## Abaixo da meta — análise

- **Início / Mobile — performance: 56 (meta 90).**
- **Detalhe do NFT (nft-3) / Mobile — performance: 59 (meta 90).**

**Performance**: o build de produção inclui a camada de mocks inteira (MSW + `@mswjs/data` + handlers + seed) porque a aplicação não tem backend real — é o que a torna um build estático "de demonstração" funcional. Esse código só interessa ao ambiente de avaliação, mas é indistinguível do resto do bundle de produção: o chunk que carrega o worker do MSW (`browser-*.js`) sozinho soma ~741 KB antes de gzip (já reduzido de ~920 KB ao mover `@mswjs/socket.io-binding` para import dinâmico, isolado no chunk `graphql-*.js`) e precisa terminar de avaliar (incluindo `seedDb()`, que popula ~239 NFTs em `localStorage` na primeira visita) antes de qualquer chamada de API poder ser respondida — isso empurra LCP/TBT/TTI para cima, principalmente no perfil mobile (CPU 4x mais lenta simulada pelo Lighthouse). Não desativei os mocks nem simplifiquei a auditoria para inflar a nota, já que isso descaracterizaria o que está sendo entregue (a instrução da seção 10 do enunciado é explícita sobre isso); em uma aplicação com backend real esse custo não existiria.
