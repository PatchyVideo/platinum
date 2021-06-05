# Contributing to PatchyVideo/platinum

## Repo Setup

Please note that in order to launch this repo, you'll need to install Node.js >=v12.

This repo is using Yarn for package menagement, make sure to use Yarn v2 while installing and linking dependencies.

For testing GraphQL, head on to <https://patchyvideo.com/be/gql/graphiql>.

### Commands

```bash
# clone the repo
$ gh repo clone PatchyVideo/platinum # or `git clone https://github.com/PatchyVideo/platinum`
$ cd platinum

# install dependencies
$ yarn

# generate code schema (required before dev / build)
$ yarn codegen

# lint & format
$ yarn lint

# launch vite dev server
$ yarn dev

# pack the website
$ yarn build
```
