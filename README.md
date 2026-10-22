# Pokédex

Pokédex em React com os 1025 Pokémon da [PokéAPI](https://pokeapi.co/), publicada em
**https://heitorlopes-dev.github.io/pokeApi/**.

- **Lista:** busca por nome ou número, filtro por tipo e paginação. Os filtros ficam na URL
  (`/pokeApi/?q=char&tipo=fire&pag=2`), então o link pode ser compartilhado e o "voltar" do
  detalhe devolve a lista como estava.
- **Detalhe:** arte oficial, descrição da Pokédex, peso, altura, base stats, fraquezas e
  resistências por tipo, habilidades, golpes aprendidos por nível e cadeia de evolução.
  Clicar numa habilidade ou golpe abre a descrição (em inglês: a PokéAPI não tem esses
  textos em português).

## Stack

React 19 + TypeScript + Vite 8 (com React Compiler), Tailwind CSS 3, TanStack Query,
React Router 7 e Zod. Os dados vêm do GraphQL da PokéAPI (`beta.pokeapi.co/graphql/v1beta`)
e cada resposta é validada com Zod.

## Comandos

Usa [Bun](https://bun.sh/).

| Comando | O que faz |
| --- | --- |
| `bun install` | Instala as dependências |
| `bun run dev` | Servidor local em http://localhost:5173/pokeApi/ |
| `bun test` | Testes (`src/**/*.test.ts`) |
| `bun run lint` | ESLint |
| `bun run build` | Checa os tipos (`tsc -b`, inclusive os testes) e gera o `dist/` |
| `bun run deploy` | Build e publicação no GitHub Pages (branch `gh-pages`) |

## Estrutura

```
src/
  pages/       Home (lista) e PokemonDetails (detalhe)
  components/  cards, diálogo de descrição, paginação, esqueletos de carregamento
  services/    chamadas à PokéAPI (GraphQL + Zod)
  hooks/       hooks do TanStack Query
  utils/       cores dos tipos, filtros da URL, cálculo de fraquezas e resistências
```

As regras puras (cadeia de evolução, fraquezas e resistências) têm testes em `*.test.ts`
ao lado do código.
