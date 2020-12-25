# Platinum

> An always-experimental frontend for [PatchyVideo/PatchyVideo](https://github.com/PatchyVideo/PatchyVideo).
> (Currently using [PatchyVideo/pvgql](https://github.com/PatchyVideo/pvgql) as backend.)

This is a **complete** rewrite of [PatchyVideo/patchyvideo-vue](https://github.com/PatchyVideo/patchyvideo-vue).

## What's New?

We used:

- [TypeScript 4](https://www.typescriptlang.org/) as programming language
- [ESLint 7](https://eslint.org/) + [Prettier 2](https://prettier.io/) as linter + formatter
- [Yarn 2](https://yarnpkg.com/) as package manager
- [Vite](https://github.com/vitejs/vite) as web build tool
- [Vue 3](https://v3.vuejs.org/) + Composition API as JavaScript framework
- [PostCSS 7](https://postcss.org/) + [TailwindCSS 2](https://tailwindcss.com/) as CSS framework
- [GraphQL](https://graphql.org/) + [Apollo Client 3](https://www.apollographql.com/) as FE<->BE communication protocol + tool

and we built an entire new website with:

- Brand new interface with full responsive design
- Darkmode support
- Full custom-able home screen
- New Video Player from ground up

## Getting Started

```bash
git clone https://github.com/PatchyVideo/platinum
cd platinum
yarn
yarn codegen # generate code schema
yarn dev # launch vite dev server
yarn build # pack the website
```

## License

MIT
