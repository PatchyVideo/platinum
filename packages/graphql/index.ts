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
  disableFragmentWarnings,
} from '@apollo/client/core'
import { filter } from 'graphql-anywhere'

import { withScalars } from 'apollo-link-scalars'
import {
  buildClientSchema,
  DefinitionNode,
  ExecutableDefinitionNode,
  FieldNode,
  FragmentDefinitionNode,
  IntrospectionQuery,
  Location,
  OperationDefinitionNode,
  parse,
  SelectionNode,
} from 'graphql'
import jsonSchema from './__generated__/graphql.schema.json'
import generatedIntrospection from './__generated__/graphql.fragment'

import * as schema from './__generated__/graphql'
export { schema }

// export { gql } from '@apollo/client/core'
export function gql(strings: TemplateStringsArray, ...content: unknown[]): string {
  return strings.reduce((accumulator, string, index) => {
    accumulator += string
    if (index in content) accumulator += content[index]
    return accumulator
  }, '')
}

const clientSymbol = Symbol('GraphQL Client Symbol')
disableFragmentWarnings()
window.parse = parse

export function createApollo(): ApolloClient<NormalizedCacheObject> {
  const typesMap = {
    DateTimeUtc: {
      serialize: (parsed: Date) => parsed.toISOString(),
      parseValue: (raw: string | null): Date | null => (raw ? new Date(raw) : null),
    },
    ObjectId: {
      serialize: (parsed: string) => parsed,
      parseValue: (raw: string | null): string | null => raw,
    },
  }
  const link = from([
    // Backend Server
    withScalars({
      schema: buildClientSchema((jsonSchema as unknown) as IntrospectionQuery),
      typesMap,
    }),
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
  options: QueryOptions<schema.Query, OperationVariables>
): Promise<ApolloQueryResult<schema.Query>> {
  const client = injectClient()
  return client.query<schema.Query>(options)
}

export function useMutate(
  options: MutationOptions<schema.Mutation, OperationVariables>
): Promise<FetchResult<schema.Mutation>> {
  const client = injectClient()
  return client.mutate<schema.Mutation>(options)
}

type QueryChildren = Record<string, BuiltGraph>

type GQLVariables = Record<string, unknown>

export type GQLGraph<QueryChildrenOptions> = {
  query: (children: QueryChildrenOptions) => DocumentNode
  queryVariables?: GQLVariables | (() => Promise<GQLVariables>)
  queryChildren?: QueryChildrenOptions
}

export type BuiltGraph = {
  query: DocumentNode
  queryVariables: () => Promise<GQLVariables>
  onQueryResult<T = unknown>(callback: (data: T) => void): void
  handleQueryResult(data: unknown): void
}

export function defineGraph<QueryChildrenOptions extends Readonly<QueryChildren> = QueryChildren>(
  frag: GQLGraph<QueryChildrenOptions>
): BuiltGraph {
  let _data: unknown
  const onQueryResultArray: ((data: unknown) => void)[] = []
  const builtFrag = {
    query: frag.query(frag.queryChildren || ({} as QueryChildrenOptions)),
    queryVariables: async () => {
      const queryVariables = {}
      if (frag.queryChildren)
        for (const childName in frag.queryChildren) {
          const child = frag.queryChildren[childName]
          Object.assign(queryVariables, await child.queryVariables())
        }
      Object.assign(
        queryVariables,
        (typeof frag.queryVariables === 'function' ? await frag.queryVariables() : frag.queryVariables) || {}
      )
      return queryVariables
    },
    handleQueryResult(data: unknown) {
      _data = data
      if (onQueryResultArray.length > 0)
        onQueryResultArray.forEach((callback) => {
          if (callback) callback(data)
        })
      const childf: Record<string, string[]> = {}
      // get fragments that children defined
      // { child: ['childFrag'] }
      for (const child in frag.queryChildren) {
        childf[child] = getDefFrags(frag.queryChildren[child].query)
      }
      // get fragments that frag defineds
      // ['frag']
      const defs = getDefFrags(builtFrag.query).filter(
        (v) =>
          !Object.values(childf)
            .map((m) => m.includes(v))
            .reduce((m, i) => i || m, false)
      )
      // get fragment link that frag uses
      // { childFrag: 'foo.bar' }
      const ufs = getUsedFrags(nodeFilter(builtFrag.query, defs))
      const cd: Record<string, string> = {}
      // link children to fragment link
      // { child: 'foo.bar' }
      for (const c in childf) {
        cd[c] = ufs[childf[c][0]]
      }
      // call children with data
      // data['foo.bar']
      for (const child in frag.queryChildren) {
        frag.queryChildren[child].handleQueryResult(
          cd[child] !== '' && (data as Record<string, unknown>)[cd[child]]
            ? (data as Record<string, unknown>)[cd[child]]
            : data
        )
      }
    },
    onQueryResult<T>(callback: (data: T) => void) {
      if (!_data) {
        onQueryResultArray.push(callback as (data: unknown) => void)
      } else {
        callback(_data as T)
      }
    },
  }
  return builtFrag
}

function nodeFilter(q: DocumentNode, names: string[]) {
  const defs: FragmentDefinitionNode | ExecutableDefinitionNode[] = []
  for (const i of q.definitions) {
    if ((i.kind === 'FragmentDefinition' || i.kind === 'OperationDefinition') && i.name && names.includes(i.name.value))
      defs.push(i)
  }
  return defs
}

function getUsedFrags(defs: readonly DefinitionNode[]) {
  const frags: Record<string, string> = {}
  for (const def of defs) {
    if (def.kind === 'FragmentDefinition' || def.kind === 'OperationDefinition') {
      const filter = (def: FragmentDefinitionNode | OperationDefinitionNode | FieldNode, path: string) => {
        if (def.selectionSet)
          for (const sel of def.selectionSet.selections) {
            switch (sel.kind) {
              case 'Field':
                filter(sel, (path ? path + '.' : '') + sel.name.value)
                break
              case 'FragmentSpread':
                frags[sel.name.value] = path
                break
            }
          }
      }
      filter(def, '')
    }
  }
  return frags
}

function getDefFrags(doc: DocumentNode) {
  const frags: string[] = []
  for (const def of doc.definitions) {
    if ((def.kind === 'FragmentDefinition' || def.kind === 'OperationDefinition') && def.name) {
      frags.push(def.name.value)
    }
  }
  return frags
}

type FragmentData = {
  doc: FragmentDefinitionNode
  export: boolean
  args: Record<string, string>
}

function parseFragment(doc: FragmentDefinitionNode) {
  const frag: FragmentData = {
    doc,
    export: false,
    args: {},
  }
  if (doc.directives)
    for (const dire of doc.directives) {
      switch (dire.name.value) {
        case 'export': {
          frag.export = true
          break
        }
        case 'param': {
          if (!dire.arguments) break
          for (const arg of dire.arguments) {
            if (arg.value.kind === 'EnumValue') frag.args[arg.name.value] = arg.value.value
          }
          break
        }
      }
    }
  return frag
}

type ChildImportMap = Record<string, string>

type ChildrenImportMap = Record<string, ChildImportMap>

type BuiltChild = {
  graphRaw: string
  exportMap: Record<string, ChildExportInfo>
}

type ChildExportInfo = {
  fragName: string
  args?: string[]
}

// type VarProcData = {
//   name: string
//   compileVar(newName: string): string
// }

export function parseGraph(graphRaw: string, children: Record<string, BuiltChild> = {}): BuiltChild {
  const childrenImportMap: ChildrenImportMap = {}
  let rpGraphRaw = graphRaw
    .split(/\r?\n/)
    .map((line) => {
      line = line.trim()
      let clearLine = false
      if (line[0] === '#') {
        const com = line.replace(/^#[\s]*/, '')
        if (com[0] === '@') {
          const operation = com.slice(1)
          const opnMatch = operation.match(/^\w+/)
          if (opnMatch)
            switch (opnMatch[0]) {
              case 'import': {
                const impMatched = operation.match(
                  /^import\s+?(\w+)(?:,\s*?({\s*?\w+\s*?(?::\s*?\w+\s*?)?(?:,\s*?\w+\s*?(?::\s*?\w+\s*?))*?}))?\s+?from\s+?["'](\w+)["']/
                )
                if (!impMatched) break
                const importMap: ChildImportMap = {
                  default: impMatched[1],
                }
                if (impMatched[2])
                  for (const child of impMatched[2].matchAll(/(\w+)\s*?:\s*?(\w+)/g)) {
                    importMap[child[1]] = child[2]
                  }
                childrenImportMap[impMatched[3]] = importMap
                clearLine = true
                break
              }
            }
        }
      }
      return clearLine ? '' : line
    })
    .join('\n')
  let depGraph = ''
  const importRename: Record<string, string> = {}
  for (const child in childrenImportMap) {
    if (!children[child]) throw new Error('Child "' + child + '" is undefined.')
    for (const impName in childrenImportMap[child]) {
      importRename[childrenImportMap[child][impName]] = children[child].exportMap[impName].fragName
    }
    depGraph += children[child].graphRaw + '\n'
  }

  const doc = parse(rpGraphRaw)
  const exportMap: Record<string, ChildExportInfo> = {}
  const cutlocs: { loc: Location; rep?: string }[] = []
  for (const def of doc.definitions) {
    switch (def.kind) {
      case 'FragmentDefinition': {
        let isExport = false
        const args: string[] = []
        if (def.directives) {
          for (const dire of def.directives) {
            switch (dire.name.value) {
              case 'param': {
                if (dire.arguments)
                  for (const arg of dire.arguments) {
                    args.push(arg.name.value)
                  }
                if (dire.loc) cutlocs.push({ loc: dire.loc })
                break
              }
              case 'export': {
                isExport = true
                if (dire.loc) cutlocs.push({ loc: dire.loc })
                break
              }
            }
          }
        }
        const cpName = btoa(Math.random().toString().substr(2)).replace(/=/g, '')
        if (def.name.loc) {
          cutlocs.push({
            loc: def.name.loc,
            rep: cpName,
          })
          importRename[def.name.value] = cpName
        }

        if (isExport) {
          exportMap[def.name.value] = {
            fragName: cpName,
            args: args,
          }
        }
        break
      }
    }
  }
  for (const def of doc.definitions) {
    switch (def.kind) {
      case 'FragmentDefinition': {
        const sels = def.selectionSet.selections
        const pSels = (sels: readonly SelectionNode[]) => {
          for (const sel of sels) {
            switch (sel.kind) {
              case 'Field': {
                if (sel.selectionSet) pSels(sel.selectionSet.selections)
                break
              }
              case 'FragmentSpread': {
                // if (sel.directives) {
                //   for (const dire of sel.directives) {
                //     switch (dire.name.value) {
                //       case 'apply': {
                //         if (dire.arguments)
                //           for (const arg of dire.arguments) {
                //             usedVarMap.push({
                //               name: arg.name.value,
                //               compileVar(newName) {
                //               },
                //             })
                //           }
                //         break
                //       }
                //     }
                //   }
                // }
                if (importRename[sel.name.value])
                  if (sel.loc)
                    cutlocs.push({
                      loc: sel.loc,
                      rep: '...' + importRename[sel.name.value],
                    })
                break
              }
            }
          }
        }
        pSels(sels)
        break
      }
    }
  }

  let totalcutloc: { start: number; end: number; rep?: string }[] = []
  for (const cutloc of cutlocs) {
    let isIncluded = false
    totalcutloc = totalcutloc.map((tcl) => {
      if (tcl.start <= cutloc.loc.start && tcl.end >= cutloc.loc.end) {
        isIncluded = true
      }
      if (tcl.start <= cutloc.loc.start && tcl.end <= cutloc.loc.end && tcl.end >= cutloc.loc.start) {
        if (tcl.rep && cutloc.rep) throw new Error('A string was required to replace twice.')
        tcl.end = cutloc.loc.end
        isIncluded = true
      }
      if (tcl.start >= cutloc.loc.start && tcl.end >= cutloc.loc.end && tcl.start <= cutloc.loc.end) {
        if (tcl.rep && cutloc.rep) throw new Error('A string was required to replace twice.')
        tcl.start = cutloc.loc.start
        isIncluded = true
      }
      if (tcl.start >= cutloc.loc.start && tcl.end <= cutloc.loc.end) {
        if (tcl.rep && cutloc.rep) throw new Error('A string was required to replace twice.')
        tcl.start = cutloc.loc.start
        tcl.end = cutloc.loc.end
        isIncluded = true
      }
      return tcl
    })
    if (!isIncluded) {
      if (cutloc.rep) {
        totalcutloc.push({
          start: cutloc.loc.start,
          end: cutloc.loc.end,
          rep: cutloc.rep,
        })
      } else {
        totalcutloc.push({
          start: cutloc.loc.start,
          end: cutloc.loc.end,
        })
      }
    }
    totalcutloc = totalcutloc.sort((a, b) => a.start - b.start)
  }
  console.log(cutlocs, totalcutloc)
  let cut = 0
  for (const cutloc of totalcutloc) {
    rpGraphRaw = rpGraphRaw.slice(0, cutloc.start - cut) + (cutloc.rep || '') + rpGraphRaw.slice(cutloc.end - cut)
    cut += cutloc.end - cutloc.start - (cutloc.rep || '').length
  }

  return {
    graphRaw: rpGraphRaw + '\n' + depGraph,
    exportMap,
  }
}

export function createGraphQLRoot(client: ApolloClient<NormalizedCacheObject>) {
  return async (frag: BuiltGraph): Promise<void> => {
    const rootQueryFrag = defineGraph({
      query({ frag }) {
        return gql`
          query rootQuery {
            ...RootFrag
          }
          ${frag.query}
        `
      },
      queryChildren: { frag },
    })
    const result = await client.query<schema.Query>({
      query: rootQueryFrag.query,
      variables: rootQueryFrag.queryVariables,
    })
    rootQueryFrag.handleQueryResult(filter(rootQueryFrag.query, result.data))
  }
}
