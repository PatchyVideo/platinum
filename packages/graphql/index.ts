import { provide, inject } from 'vue'
import {
  ApolloClient,
  InMemoryCache,
  NormalizedCacheObject,
  from,
  HttpLink,
  OperationVariables,
  ApolloQueryResult,
  QueryOptions,
  MutationOptions,
  FetchResult,
} from '@apollo/client/core'

import { withScalars } from 'apollo-link-scalars'
import { buildClientSchema, IntrospectionQuery } from 'graphql'
import jsonSchema from './__generated__/graphql.schema.json'

import * as schema from './__generated__/graphql'
export { schema }

import { QueryRoot, MutationRoot } from './__generated__/graphql'

export { gql } from '@apollo/client/core'

const clientSymbol = Symbol('ApolloClient Symbol')

export function createApollo(): ApolloClient<NormalizedCacheObject> {
  const typesMap = {
    DateTimeUtc: {
      serialize: (parsed: Date) => parsed.toISOString(),
      parseValue: (raw: string | null): Date | null => {
        return raw ? new Date(raw) : null
      },
    },
  }
  const link = from([
    // Backend Server
    withScalars({ schema: buildClientSchema((jsonSchema as unknown) as IntrospectionQuery), typesMap }),
    new HttpLink({ uri: 'http://localhost:8080/graphql' }),
  ])
  const cache = new InMemoryCache()
  const client = new ApolloClient({
    link,
    cache,
  })
  provideClient(client)
  return client
}

function provideClient(client: ApolloClient<NormalizedCacheObject>) {
  provide(clientSymbol, client)
}

function injectClient() {
  const client = inject<ApolloClient<NormalizedCacheObject>>(clientSymbol)
  return client || createApollo()
}

export function useApollo(): ApolloClient<NormalizedCacheObject> {
  const client = injectClient()
  return client
}

export function useQuery(
  options: QueryOptions<QueryRoot, OperationVariables>
): Promise<ApolloQueryResult<schema.QueryRoot>> {
  const client = injectClient()
  return client.query<QueryRoot>(options)
}

export function useMutate(
  options: MutationOptions<MutationRoot, OperationVariables>
): Promise<FetchResult<MutationRoot>> {
  const client = injectClient()
  return client.mutate<MutationRoot>(options)
}
