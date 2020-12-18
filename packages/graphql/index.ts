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
  DocumentNode,
  gql,
} from '@apollo/client/core'
import { filter } from 'graphql-anywhere'

import { withScalars } from 'apollo-link-scalars'
import { buildClientSchema, IntrospectionQuery } from 'graphql'
import jsonSchema from './__generated__/graphql.schema.json'
import generatedIntrospection from './__generated__/graphql.fragment'

import * as schema from './__generated__/graphql'
export { schema }

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
  const cache = new InMemoryCache({
    possibleTypes: generatedIntrospection.possibleTypes,
  })
  const client = new ApolloClient({
    link,
    cache,
  })
  return client
}

export function provideClient(client: ApolloClient<NormalizedCacheObject>): void {
  provide(clientSymbol, client)
}

export function injectClient(): ApolloClient<NormalizedCacheObject> {
  const client = inject<ApolloClient<NormalizedCacheObject>>(clientSymbol)
  return client || createApollo()
}

export function useApollo(): ApolloClient<NormalizedCacheObject> {
  const client = injectClient()
  return client
}

export function useQuery(
  options: QueryOptions<schema.QueryRoot, OperationVariables>
): Promise<ApolloQueryResult<schema.QueryRoot>> {
  const client = injectClient()
  return client.query<schema.QueryRoot>(options)
}

export function useMutate(
  options: MutationOptions<schema.MutationRoot, OperationVariables>
): Promise<FetchResult<schema.MutationRoot>> {
  const client = injectClient()
  return client.mutate<schema.MutationRoot>(options)
}

export type GQLFragment<T = unknown> = {
  query: DocumentNode
  queryVariables?: Record<string, never>
  queryChildren?: BuildedFragment[]
  onQueryResult?(data: T): void
}

export type BuildedFragment<T = unknown> = {
  query: DocumentNode
  queryVariables?: Record<string, never>
  onQueryResult(callback: (data: T) => void): void
  handleQueryResult(data: T): void
}

export function defineFragment<T = unknown>(frag: GQLFragment<T>): BuildedFragment<T> {
  let _data: unknown
  const onQueryResultArray: ((data: T) => void)[] = []
  if (frag.onQueryResult) onQueryResultArray.push(frag.onQueryResult)
  return {
    query: frag.query,
    queryVariables: (() => {
      const queryVariables = {}
      if (frag.queryChildren)
        frag.queryChildren.forEach((child) => {
          if (child.queryVariables) Object.assign(queryVariables, child.queryVariables)
        })
      Object.assign(queryVariables, frag.queryVariables)
      return queryVariables == {} ? queryVariables : undefined
    })(),
    handleQueryResult(data) {
      _data = data
      if (onQueryResultArray.length > 0)
        onQueryResultArray.forEach((callback) => {
          if (callback) callback(data)
        })
      if (frag.queryChildren)
        frag.queryChildren.forEach((child) => {
          child.handleQueryResult(filter(child.query, data))
        })
    },
    onQueryResult(callback) {
      if (!_data) {
        onQueryResultArray.push(callback)
      } else {
        callback(_data as T)
      }
    },
  }
}

export function createGraphQLRoot(client: ApolloClient<NormalizedCacheObject>) {
  return async (frag: BuildedFragment): Promise<void> => {
    const rootQueryFrag = defineFragment({
      query: gql`
        query rootQuery {
          ...RootFrag
        }
        ${frag.query}
      `,
      queryChildren: [frag],
    })
    const result = await client.query<schema.QueryRoot>({
      query: rootQueryFrag.query,
      variables: rootQueryFrag.queryVariables,
    })
    rootQueryFrag.handleQueryResult(result.data)
  }
}
