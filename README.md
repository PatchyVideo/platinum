# Platinum

> An always-experimental frontend for [PatchyVideo/PatchyVideo](https://github.com/PatchyVideo/PatchyVideo).
> (Currently using [PatchyVideo/pvgql](https://github.com/PatchyVideo/pvgql) as backend.)

This is a **complete** rewrite of [PatchyVideo/patchyvideo-vue](https://github.com/PatchyVideo/patchyvideo-vue).

## Alpha Roadmap

It's hard to tell based on what we did so far. All the things we did are basically Proof of Concepts.
But we expect to ship following features on top of the current website:

- [ ] A brand new interface with full responsive design.
- [ ] Full dark mode support.
- [ ] Full custom-able home screen / user profile.
- [ ] A new home made video player.

## Getting Started

### Preparation

- Node.js (>= v12)
  - Some Linux distro includes Node.js v10 by default, you'll need to upgrade it.
- Yarn
  - We use Yarn for package menagement, so you'll need that.
  - Any pull request using npm / includes `package-lock.json` will be closed.
- Visual Studio Code (optional)
  - We use Visual Studio Code as our primary editor.
  - Recommended plugins:
    - ESLint (dbaeumer.vscode-eslint)
    - Prettier - Code formatter (esbenp.prettier-vscode)
    - Vetur (octref.vetur) or Volar (johnsoncodehk.volar)
      - Vetur doesn't support types in template, Volar doesn't support PostCSS, so it's down to you.
    - PostCSS Language Support (csstools.postcss)
    - i18n Ally (lokalise.i18n-ally)
    - Conventional Commits (vivaxy.vscode-conventional-commits)
    - Apollo GraphQL (apollographql.vscode-apollo)
      - Just for types in graphql, submit query etc is not working.
- [PatchyVideo/pvgql](https://github.com/PatchyVideo/pvgql) (optional)
  - If you wants to test GraphQL request, we recommend you install pvgql locally caus GraphiQL isn't supported on the production server.
  - Guide: <https://github.com/PatchyVideo/pvgql#usage>. Once you're done, you can open up `http://localhost:5008/graphiql`.

### Build Step

```bash
gh repo clone PatchyVideo/platinum # or `git clone https://github.com/PatchyVideo/platinum`
cd platinum
yarn
yarn codegen # generate code schema
yarn dev # launch vite dev server
yarn build # pack the website
```

## License

MIT
