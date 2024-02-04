import type { SafeReadonly } from '@apollo/client/cache/core/types/common'
import type { FieldFunctionOptions } from '@apollo/client/core'
import { InMemoryCache } from '@apollo/client/core'
import { offsetLimitPagination } from '@apollo/client/utilities'

import generatedIntrospection from '@/composables/graphql/dist/fragments'

function childOffsetLimitPara(tagName: string) {
  return {
    read(existing: SafeReadonly<any> | undefined, { args }: FieldFunctionOptions): any {
      if (!args)
        throw new Error('childOffsetLimitPara: args is undefined')
      return (
        existing && {
          ...existing,
          [tagName]: existing[tagName].slice(args.para.offset, args.para.offset + args.para.limit),
        }
      )
    },
    merge(
      existing: SafeReadonly<any> | undefined,
      incoming: SafeReadonly<any>,
      { args, mergeObjects }: FieldFunctionOptions,
    ): any {
      return {
        ...mergeObjects(existing, incoming),
        [tagName]: (() => {
          const merged = existing ? existing[tagName].slice(0) : []
          if (args) {
          // Assume an offset of 0 if args.offset omitted.
            const { offset = 0 } = args.para
            for (let i = 0; i < incoming[tagName].length; ++i)
              merged[offset + i] = incoming[tagName][i]
          }
          return merged
        })(),
      }
    },
  }
}
// const selfOffsetLimitPara = () => ({
//   read(existing: SafeReadonly<any> | undefined, { args }: FieldFunctionOptions): any {
//     if (!args)
//       throw new Error('selfOffsetLimitPara: args is undefined')
//     return existing && existing.slice(args.para.offset, args.para.offset + args.para.limit)
//   },
//   merge(existing: SafeReadonly<any> | undefined, incoming: SafeReadonly<any>, { args }: FieldFunctionOptions): any {
//     const merged = existing ? existing.slice(0) : []
//     if (args) {
//       // Assume an offset of 0 if args.offset omitted.
//       const { offset = 0 } = args.para
//       for (let i = 0; i < incoming.length; ++i)
//         merged[offset + i] = incoming[i]
//     }
//     return merged
//   },
// })
export const cache = new InMemoryCache({
  possibleTypes: generatedIntrospection.possibleTypes,
  typePolicies: {
    Query: {
      fields: {
        listPlaylist: {
          ...childOffsetLimitPara('playlists'),
          keyArgs: ['para', ['query', 'order', 'additionalConstraint']],
        },
        listVideo: {
          ...childOffsetLimitPara('videos'),
          keyArgs: [
            'para',
            ['query', 'qtype', 'order', 'additionalConstraint', 'hidePlaceholder', 'lang', 'humanReadableTag'],
          ],
        },
        listTagObjects: {
          ...childOffsetLimitPara('tags'),
          keyArgs: ['para', ['query', 'queryRegex', 'category', 'order']],
        },
        // listNotifications: {
        //   ...childOffsetLimitPara('notes'),
        //   keyArgs: ['para', ['listAll', 'noteType']],
        // },
        listSubscriptionVideos: {
          ...childOffsetLimitPara('videos'),
          keyArgs: ['para', ['query', 'queryRegex', 'category', 'order']],
        },
      },
    },
    Playlist: {
      fields: {
        videos: {
          ...offsetLimitPagination(),
        },
      },
    },
  },
})
