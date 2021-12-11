# Contributing to PatchyVideo/platinum

## Repo Setup

Please note that in order to launch this repo, you'll need to install Node.js >=v16.

This repo is using [pnpm](https://pnpm.io/) for package menagement,
make sure to use pnpm while installing and linking dependencies.

We recommend using [Visual Studio Code](https://code.visualstudio.com/) for code editing.
Be sure to install recommended extensions.

For testing GraphQL, head on to <https://patchyvideo.com/be/gql/graphiql>.

### Commands

```bash
# clone the repo
$ gh repo clone PatchyVideo/platinum # or `git clone https://github.com/PatchyVideo/platinum`
$ cd platinum

# install dependencies
$ pnpm i

# generate code schema (required before dev / build)
$ pnpm codegen

# lint & format
$ pnpm lint

# launch vite dev server
$ pnpm dev

# pack the website
$ pnpm build
```
