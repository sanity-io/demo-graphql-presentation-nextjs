import {
  cacheExchange,
  fetchExchange,
  type SSRExchange,
  type ClientOptions,
} from '@urql/core'

import { graphqlApiUrl, studioUrl } from '@/sanity/lib/api'
import {
  sanityExchange,
  type SanityExchangeConfig,
} from '@/sanity/lib/urql-exchange'

/**
 * This function is designed to be used with scenarios like `import { withUrqlClient } from 'next-urql'` where
 * the ssr exchange requires special handling, and where the `token` is provided for fetching draft content.
 */
export const getClientOptions = (
  config: {
    ssr?: SSRExchange
    token?: string
  } & Pick<SanityExchangeConfig, 'stega' | 'perspective'>,
) => {
  const { ssr, token, perspective = 'published', stega = false } = config
  /**
   * Configure how the Content Source Maps are transcoded into stega data that Vercel Visual Editing and Sanity Presentation understands
   */
  const sanityExchangeConfig = {
    perspective,
    stega,
    studioUrl,
    logger: console,
    filter: (props) => {
      if (props.sourcePath.at(-1) === 'title') {
        return true
      }

      return props.filterDefault(props)
    },
  } satisfies SanityExchangeConfig

  return {
    url: graphqlApiUrl,
    exchanges: ssr
      ? [
          cacheExchange,
          ssr,
          sanityExchange(sanityExchangeConfig),
          fetchExchange,
        ]
      : [cacheExchange, sanityExchange(sanityExchangeConfig), fetchExchange],
    fetchOptions: token
      ? {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      : {},
  } satisfies ClientOptions
}
