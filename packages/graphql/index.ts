import {
  provide,
  inject,
  ComputedRef,
  Ref,
  computed,
  reactive,
  toRefs,
  isReactive,
  unref,
  watch,
  watchEffect,
} from 'vue'
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
  disableFragmentWarnings,
  ApolloError,
} from '@apollo/client/core'
import get from 'lodash.get'
import { ObjectID } from 'bson'

import { withScalars } from 'apollo-link-scalars'
import {
  ArgumentNode,
  buildClientSchema,
  IntrospectionQuery,
  Location,
  ObjectFieldNode,
  parse,
  SelectionNode,
} from 'graphql'
import jsonSchema from './__generated__/graphql.schema.json'
import generatedIntrospection from './__generated__/graphql.fragment'

import * as schema from './__generated__/graphql'
import { notify } from '@/notification'
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

export function createApollo(): ApolloClient<NormalizedCacheObject> {
  const typesMap = {
    DateTimeUtc: {
      serialize: (parsed: Date) => parsed.toISOString(),
      parseValue: (raw: string | null): Date | null => (raw ? new Date(raw) : null),
    },
    ObjectId: {
      serialize: (parsed: ObjectID) => parsed.toHexString(),
      parseValue: (raw: string) => new ObjectID(raw),
    },
    FETagCategories: {
      serialize: (parsed: string) => parsed,
      parseValue: (raw: string | null): string | null => raw,
    },
    FEUserImage: {
      serialize: (parsed: string) => parsed.replace(new RegExp('^https://patchyvideo.com/be/images/userphotos/'), ''),
      parseValue: (raw: string | null): string | null => 'https://patchyvideo.com/be/images/userphotos/' + raw,
    },
    FECoverImage: {
      serialize: (parsed: string) => parsed.replace(new RegExp('^https://patchyvideo.com/be/images/covers/'), ''),
      parseValue: (raw: string | null): string | null => 'https://patchyvideo.com/be/images/covers/' + raw,
    },
  }
  const link = from([
    // Backend Server
    withScalars({
      schema: buildClientSchema((jsonSchema as unknown) as IntrospectionQuery),
      typesMap,
    }),
    new HttpLink({ uri: 'http://localhost:5008/graphql' }),
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

type ChildImportMap = Record<string, string>

type ChildrenImportMap = Record<string, ChildImportMap>

export type BuiltChild = {
  graphRaw: string
  exportMap: Record<string, ChildExportInfo>
  varMap: Record<string, string>
  varTypeMap: Record<string, string>
  children: Children
  fragmentDatas: FragmentDatas
  buildVars(vars: Record<string, Ref<unknown>>): ComputedRef<Record<string, Ref<unknown>>>
  onFragmentData<T = unknown>(fragmentName: string, callback?: (data: T) => void): Promise<T>
  handleFragmentData(fragmentName: string, data: unknown): void
  isReady: ComputedRef<boolean>
  ready(): void
}

type Children = Record<string, BuiltChild>

type FragmentDatas = Record<string, FragmentData>

type FragmentData = {
  importedFragments: ImportedFragment[]
}

type ImportedFragment = {
  fragmentName: string
  fragmentNameOriginal: string
  fragImportLocation: FragImportLocation
  fragmentData: FragmentData
}

type FragImportLocation = string

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
  children?: Children
  variables?: ((vars: Record<string, Ref<unknown>>) => Record<string, unknown>) | Record<string, unknown>
  isReady?: Ref<boolean>
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
  const unchildrenImportMap: Record<string, Record<string, string>> = {}
  for (const child in childrenImportMap) {
    if (!children[child]) throw new Error('Child "' + child + '" is undefined.')
    unchildrenImportMap[child] = {}
    for (const impName in childrenImportMap[child]) {
      unchildrenImportMap[child][childrenImportMap[child][impName]] = impName
      importRename[childrenImportMap[child][impName]] = children[child].exportMap[impName].fragName
      fragBelongTo[children[child].exportMap[impName].fragName] = child
    }
    depGraph += children[child].graphRaw + '\n'
  }

  const doc = parse(rpGraphRaw)
  const exportMap: Record<string, ChildExportInfo> = {}
  const cutlocs: { loc: Location; rep?: string }[] = []
  const varTypeMapUnc: Record<string, Record<string, string>> = {}
  for (const def of doc.definitions) {
    switch (def.kind) {
      case 'FragmentDefinition': {
        let isExport = false
        const args: string[] = []
        const argTypeMap: Record<string, string> = {}
        if (def.directives) {
          for (const dire of def.directives) {
            switch (dire.name.value) {
              case 'param': {
                if (dire.arguments)
                  for (const arg of dire.arguments) {
                    args.push(arg.name.value)
                    if (arg.value.kind === 'EnumValue') argTypeMap[arg.name.value] = arg.value.value
                  }
                if (dire.loc) cutlocs.push({ loc: dire.loc })
                break
              }
              case 'vari': {
                if (dire.arguments)
                  for (const arg of dire.arguments) {
                    if (arg.value.kind === 'EnumValue') argTypeMap[arg.name.value] = arg.value.value
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

        varTypeMapUnc[cpName] = argTypeMap

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
  const varTypeMap: Record<string, string> = {}
  const childrenVarMap: Record<string, Record<string, string>> = {}
  const fragmentDatas: FragmentDatas = {}

  for (const def of doc.definitions) {
    switch (def.kind) {
      case 'FragmentDefinition': {
        fragmentDatas[def.name.value] = fragmentDatas[def.name.value] || {
          importedFragments: [],
        }
        const sels = def.selectionSet.selections
        const pSels = (sels: readonly SelectionNode[], selName: string) => {
          for (const sel of sels) {
            switch (sel.kind) {
              case 'Field': {
                if (sel.selectionSet) {
                  pSels(sel.selectionSet.selections, selName + sel.name.value + '.')
                }
                if (sel.arguments)
                  for (const arg of sel.arguments) {
                    const pArgs = (arg: ArgumentNode | ObjectFieldNode) => {
                      switch (arg.value.kind) {
                        case 'Variable': {
                          if (!(arg.value.name.value in varMap)) {
                            varMap[arg.value.name.value] = createRandomString()
                            varTypeMap[varMap[arg.value.name.value]] =
                              varTypeMapUnc[importRename[def.name.value]][arg.value.name.value]
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
                const childName = importRename[sel.name.value] ? fragBelongTo[importRename[sel.name.value]] : undefined
                if (childName) {
                  const f = fragmentDatas[def.name.value]
                  f.importedFragments.push({
                    fragmentName: importRename[sel.name.value],
                    fragmentNameOriginal: unchildrenImportMap[childName][sel.name.value],
                    fragImportLocation: selName,
                    fragmentData: children[childName].fragmentDatas[unchildrenImportMap[childName][sel.name.value]],
                  })
                }
                if (sel.directives) {
                  for (const dire of sel.directives) {
                    switch (dire.name.value) {
                      case 'apply': {
                        if (dire.arguments) {
                          if (childName) {
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
        pSels(sels, '')
        break
      }
    }
  }

  rpGraphRaw = cutByLocation(
    rpGraphRaw,
    cutlocs.map((v) => ({ start: v.loc.start, end: v.loc.end, rep: v.rep }))
  )

  const pendingOnQueryData: Record<string, ((data: unknown) => void)[]> = {}
  const resolvedData: Record<string, unknown> = {}

  return {
    graphRaw: rpGraphRaw + '\n' + depGraph,
    exportMap,
    varMap,
    varTypeMap: (() => {
      for (const childName in children) {
        const child = children[childName]
        for (const key in child.varTypeMap) {
          varTypeMap[key] = child.varTypeMap[key]
        }
      }
      return varTypeMap
    })(),
    children,
    fragmentDatas,
    buildVars(vars) {
      return computed(() => {
        let nVars: Record<string, Ref<unknown>> = {}
        const nVarMap: Record<string, string> = { ...varMap }
        const deVarMap: Record<string, string> = {}
        for (const key in nVarMap) deVarMap[nVarMap[key]] = key
        for (const varName in vars) nVars[deVarMap[varName] || varName] = vars[varName]
        if (graphData.variables)
          if (typeof graphData.variables === 'function') {
            let nret = graphData.variables(nVars)
            if (!isReactive(nret)) nret = reactive(graphData.variables(nVars))
            nVars = { ...nVars, ...toRefs(nret) }
          } else {
            nVars = { ...nVars, ...toRefs(reactive(graphData.variables)) }
          }
        for (const childName in children) {
          const child = children[childName]
          const deChildVarMap: Record<string, string> = {}
          for (const key in childrenVarMap[childName]) deChildVarMap[childrenVarMap[childName][key]] = key
          const nVarsTemp: Record<string, Ref<unknown>> = {}
          for (const varName in nVars) nVarsTemp[deChildVarMap[varName] || varName] = nVars[varName]
          const nVarsTempC = child.buildVars(nVarsTemp)
          for (const varName in nVarsTempC.value) {
            nVars[varName] = nVarsTempC.value[varName]
            nVarMap[varName] = varName
          }
        }
        const rVars: Record<string, Ref<unknown>> = {}
        for (const varName in nVars) if (nVarMap[varName]) rVars[nVarMap[varName]] = nVars[varName]
        return rVars
      })
    },
    onFragmentData<T>(fragmentName: string, callback?: (data: T) => void): Promise<T> {
      if (resolvedData[fragmentName]) {
        if (callback) callback(resolvedData[fragmentName] as T)
        return new Promise<T>((resolve) => {
          resolve(resolvedData[fragmentName] as T)
        })
      } else {
        pendingOnQueryData[fragmentName] = pendingOnQueryData[fragmentName] || []
        if (callback) pendingOnQueryData[fragmentName].push(callback as (data: unknown) => void)
        return new Promise<T>((resolve) => {
          pendingOnQueryData[fragmentName].push(resolve as (data: unknown) => void)
        })
      }
    },
    handleFragmentData(fragmentName: string, data: unknown) {
      resolvedData[fragmentName] = data
      for (const callback of pendingOnQueryData[fragmentName] || []) callback(data)
      for (const impdFrag of fragmentDatas[fragmentName]?.importedFragments || []) {
        children[fragBelongTo[impdFrag.fragmentName]].handleFragmentData(
          impdFrag.fragmentNameOriginal,
          get(data, impdFrag.fragImportLocation.slice(0, impdFrag.fragImportLocation.length - 1)) as unknown
        )
      }
    },
    isReady: computed(() => {
      const is = (v: Ref<boolean> | undefined) => (v === undefined ? true : v.value)
      return Object.values(children).reduce((p, v) => p && is(v.isReady), is(graphData.isReady))
    }),
    ready() {
      if (graphData.isReady) graphData.isReady.value = true
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

export async function buildGraph(graph: BuiltChild, client: ApolloClient<NormalizedCacheObject>): Promise<void> {
  if (!graph.exportMap.default) throw new Error('A Graph must contain a default export.')

  let posting = false

  const variRef = graph.buildVars({})

  const buildVari = (variRef: ComputedRef<Record<string, Ref<unknown>>> | Record<string, Ref<unknown>>) => {
    const variables: Record<string, unknown> = {}
    const variun = unref(variRef)
    for (const vari in variun) variables[vari] = unref(variun[vari])
    return variables
  }

  const variables = buildVari(variRef.value)

  let variString = ''
  if (Object.keys(variables).length > 0) {
    variString = '('
    for (const vari in variables)
      variString +=
        '$' +
        vari +
        ':' +
        (graph.varTypeMap[vari] ||
          (() => {
            throw new Error()
          })()) +
        '!,'
    variString = variString.slice(0, variString.length - 1) + ')'
  }

  watch(
    variRef,
    () => {
      if (!posting) submitQuery()
    },
    { flush: 'post' }
  )

  const submitQuery = async () => {
    posting = true
    const query = parse(`query rootQuery ${variString} {...${graph.exportMap.default.fragName}}\n${graph.graphRaw}`)

    if (!graph.isReady.value) {
      await new Promise<void>((resolve) => {
        watchEffect(
          () => {
            if (graph.isReady.value) resolve()
          },
          { flush: 'post' }
        )
      })
    }

    const querying = client.query({ query: query, variables: buildVari(variRef.value) })

    querying.catch((e: ApolloError) => {
      notify('error', e.message, -1)
    })

    const result = await querying

    posting = false

    graph.handleFragmentData('default', result.data)
  }
  submitQuery()
}
