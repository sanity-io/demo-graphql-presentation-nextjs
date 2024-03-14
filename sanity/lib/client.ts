import { cacheExchange, createClient, fetchExchange } from '@urql/core'
import type { ClientPerspective } from 'next-sanity'
import { cache } from 'react'

import {
  dataset,
  graphqlApiVersion,
  graphqlTag,
  projectId,
} from '@/sanity/lib/api'
import { token } from '@/sanity/lib/token'

export function defineClientUrl(config: {
  useCdn: boolean
  perspective: Omit<ClientPerspective, 'raw'>
  resultSourceMap: boolean
}): string {
  const { useCdn, perspective } = config
  const url = new URL(
    `https://${projectId}.${useCdn ? 'apicdn' : 'api'}.sanity.io/v${graphqlApiVersion}/graphql/${dataset}/${graphqlTag}/`,
  )

  url.searchParams.set('perspective', perspective as string)
  if (config.resultSourceMap) {
    url.searchParams.set('resultSourceMap', 'true')
  }
  return url.toString()
}

const makeClient = (
  perspective: Omit<ClientPerspective, 'raw'>,
  resultSourceMap: boolean,
) => {
  switch (perspective) {
    case 'published':
      /**
       * In production we use the CDN, the 'published' perspective and optimize for cache TTL and re-use.
       * If you are using a private dataset then you'll need to set the `Authorization` header like in `previewDrafts`.
       */
      return createClient({
        url: defineClientUrl({ useCdn: true, perspective, resultSourceMap }),
        exchanges: [cacheExchange, fetchExchange],
        fetchOptions: {
          // When using the `published` perspective we use time-based revalidation to match the time-to-live on Sanity's API CDN (30 seconds)
          // https://www.sanity.io/docs/graphql#f79d83e447f8
          next: { revalidate: 30 },
        },
      })
    case 'previewDrafts':
      return createClient({
        url: defineClientUrl({ useCdn: false, perspective, resultSourceMap }),
        exchanges: [cacheExchange, fetchExchange],
        fetchOptions: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          // We can't cache the responses as it would slow down the live preview experience
          next: { revalidate: 0 },
        },
      })
    default:
      throw new Error(`Unknown perspective: ${perspective}`)
  }
}
export const getClient = cache(makeClient)
