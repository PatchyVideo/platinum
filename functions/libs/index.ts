// @ts-check

import { encode } from 'html-entities'
import type { ExecutionResult } from 'graphql'
import type { Query } from '../../packages/graphql/__generated__/graphql'

export const indexHtml = '__INDEX_HTML__'

export function queryGraphQL(gql: string, vari: unknown) {
  return fetch('https://patchyvideo.com/be/gql/graphql', {
    method: 'POST',
    headers: new Headers({
      'Content-Type': 'application/json',
    }),
    body: JSON.stringify({
      query: gql,
      variables: vari,
    }),
  }).then(res => res.json() as ExecutionResult<Query>)
}

export function encodeHTML(string: string, replaceBr = true) {
  return encode(replaceBr ? string.replace(/[\n\r]/g, ' ') : string, { level: 'xml' })
}

export function returnHTML(html: string) {
  return new Response(html, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
    },
  })
}

export function returnDefault() {
  return returnHTML(indexHtml)
}
