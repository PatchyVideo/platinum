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
  ArgumentNode,
  buildClientSchema,
  DefinitionNode,
  ExecutableDefinitionNode,
  FieldNode,
  FragmentDefinitionNode,
  IntrospectionQuery,
  Location,
  ObjectFieldNode,
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
  varMap: Record<string, string>
  children: Record<string, BuiltChild>
  buildVars(vars: Record<string, unknown>): Record<string, unknown>
}

type ChildExportInfo = {
  fragName: string
  args?: string[]
}

// type VarProcData = {
//   name: string
//   compileVar(newName: string): string
// }

type GraphData = {
  graphRaw: string
  children?: Record<string, BuiltChild>
  variables?: ((vars: Record<string, unknown>) => Record<string, unknown>) | Record<string, unknown>
}

export function parseGraph(graphData: GraphData): BuiltChild {
  const childrenImportMap: ChildrenImportMap = {}
  const children = graphData.children || {}
  const variables = graphData.variables || {}
  let rpGraphRaw = graphData.graphRaw
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
  const fragBelongTo: Record<string, string> = {}
  for (const child in childrenImportMap) {
    if (!children[child]) throw new Error('Child "' + child + '" is undefined.')
    for (const impName in childrenImportMap[child]) {
      importRename[childrenImportMap[child][impName]] = children[child].exportMap[impName].fragName
      fragBelongTo[children[child].exportMap[impName].fragName] = child
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
        const cpName = createRandomString()
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

  const spVars: Record<string, string> = {}
  const varMap: Record<string, string> = {}
  const childrenVarMap: Record<string, Record<string, string>> = {}

  for (const def of doc.definitions) {
    switch (def.kind) {
      case 'FragmentDefinition': {
        const sels = def.selectionSet.selections
        const pSels = (sels: readonly SelectionNode[]) => {
          for (const sel of sels) {
            switch (sel.kind) {
              case 'Field': {
                if (sel.selectionSet) pSels(sel.selectionSet.selections)
                if (sel.arguments)
                  for (const arg of sel.arguments) {
                    const pArgs = (arg: ArgumentNode | ObjectFieldNode) => {
                      switch (arg.value.kind) {
                        case 'Variable': {
                          if (!(arg.value.name.value in varMap)) {
                            varMap[arg.value.name.value] = createRandomString()
                          }
                          if (arg.value.loc)
                            cutlocs.push({
                              loc: arg.value.loc,
                              rep: '$' + varMap[arg.value.name.value],
                            })
                          break
                        }
                        case 'ObjectValue': {
                          for (const oarg of arg.value.fields) pArgs(oarg)
                          break
                        }
                      }
                    }
                    pArgs(arg)
                  }
                break
              }
              case 'FragmentSpread': {
                if (sel.directives) {
                  for (const dire of sel.directives) {
                    switch (dire.name.value) {
                      case 'apply': {
                        if (dire.arguments) {
                          if (importRename[sel.name.value]) {
                            const childName = fragBelongTo[importRename[sel.name.value]]
                            childrenVarMap[childName] = childrenVarMap[childName] || {}
                            for (const arg of dire.arguments) {
                              if (arg.name.value in variables) {
                                if (!(arg.name.value in spVars)) spVars[arg.name.value] = createRandomString()
                                childrenVarMap[childName][arg.name.value] = spVars[arg.name.value]
                                const child = children[childName]
                                const em =
                                  (() => {
                                    for (const name in child.exportMap)
                                      if (child.exportMap[name].fragName === importRename[sel.name.value])
                                        return child.exportMap[name]
                                  })() ||
                                  (() => {
                                    throw new Error()
                                  })()
                                if (em.args)
                                  em.args.forEach((emArg) => {
                                    depGraph.replace(child.varMap[emArg], spVars[arg.name.value])
                                  })
                              }
                            }
                          }
                        }
                        break
                      }
                    }
                  }
                }
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

  rpGraphRaw = cutByLocation(
    rpGraphRaw,
    cutlocs.map((v) => ({ start: v.loc.start, end: v.loc.end, rep: v.rep }))
  )

  return {
    graphRaw: rpGraphRaw + '\n' + depGraph,
    exportMap,
    varMap,
    children,
    buildVars(vars) {
      return {
        ...(() => {
          let nVars: Record<string, unknown> = {}
          const nVarMap: Record<string, string> = { ...varMap }
          const deVarMap: Record<string, string> = {}
          for (const key in nVarMap) deVarMap[nVarMap[key]] = key
          for (const varName in vars) nVars[deVarMap[varName] || varName] = vars[varName]
          if (graphData.variables)
            if (typeof graphData.variables === 'function') {
              nVars = { ...nVars, ...graphData.variables(nVars) }
            } else {
              nVars = { ...nVars, ...graphData.variables }
            }
          for (const childName in children) {
            const child = children[childName]
            const deChildVarMap: Record<string, string> = {}
            for (const key in childrenVarMap[childName]) deChildVarMap[childrenVarMap[childName][key]] = key
            let nVarsTemp: Record<string, unknown> = {}
            for (const varName in nVars) nVarsTemp[deChildVarMap[varName] || varName] = nVars[varName]
            nVarsTemp = child.buildVars(nVarsTemp)
            for (const varName in nVarsTemp) {
              nVars[varName] = nVarsTemp[varName]
              nVarMap[varName] = varName
            }
          }
          const rVars: Record<string, unknown> = {}
          for (const varName in nVars) if (nVarMap[varName]) rVars[nVarMap[varName]] = nVars[varName]
          return rVars
        })(),
      }
    },
  }
}

type CutLocation = {
  start: number
  end: number
  rep?: string
}

function cutByLocation(str: string, cutLocations: CutLocation[]): string {
  let totalcutloc: { start: number; end: number; rep?: string }[] = []
  for (const cutloc of cutLocations) {
    let isIncluded = false
    totalcutloc = totalcutloc.map((tcl) => {
      if (tcl.start <= cutloc.start && tcl.end >= cutloc.end) {
        isIncluded = true
      }
      if (tcl.start <= cutloc.start && tcl.end <= cutloc.end && tcl.end >= cutloc.start) {
        if (tcl.rep && cutloc.rep) throw new Error('A string was required to replace twice.')
        tcl.end = cutloc.end
        isIncluded = true
      }
      if (tcl.start >= cutloc.start && tcl.end >= cutloc.end && tcl.start <= cutloc.end) {
        if (tcl.rep && cutloc.rep) throw new Error('A string was required to replace twice.')
        tcl.start = cutloc.start
        isIncluded = true
      }
      if (tcl.start >= cutloc.start && tcl.end <= cutloc.end) {
        if (tcl.rep && cutloc.rep) throw new Error('A string was required to replace twice.')
        tcl.start = cutloc.start
        tcl.end = cutloc.end
        isIncluded = true
      }
      return tcl
    })
    if (!isIncluded) {
      if (cutloc.rep) {
        totalcutloc.push({
          start: cutloc.start,
          end: cutloc.end,
          rep: cutloc.rep,
        })
      } else {
        totalcutloc.push({
          start: cutloc.start,
          end: cutloc.end,
        })
      }
    }
    totalcutloc = totalcutloc.sort((a, b) => a.start - b.start)
  }
  let cut = 0
  let ns = str
  for (const cutloc of totalcutloc) {
    ns = ns.slice(0, cutloc.start - cut) + (cutloc.rep || '') + ns.slice(cutloc.end - cut)
    cut += cutloc.end - cutloc.start - (cutloc.rep || '').length
  }
  return ns
}

function createRandomString() {
  return 'N' + btoa(Math.random().toString().substr(2)).replace(/=/g, '')
}

function buildGraph(graph: BuiltChild, variables: Record<string, never>, client: ApolloClient<NormalizedCacheObject>) {
  if (!graph.exportMap.default) throw new Error('A Graph must contain a default export.')

  const doc = parse(graph.graphRaw)
  const cutlocs: { loc: Location; rep?: string }[] = []
  for (const def of doc.definitions) {
    switch (def.kind) {
      case 'FragmentDefinition': {
        if (def.name.value === graph.exportMap.default.fragName) {
          //TODO
        }
        break
      }
    }
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
