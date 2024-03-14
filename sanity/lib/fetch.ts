import type { ClientPerspective, ContentSourceMap } from 'next-sanity'
import { draftMode } from 'next/headers'
import { stegaEncodeSourceMap } from '@sanity/client/stega'
import type { AnyVariables, DocumentInput } from '@urql/core'

import { getClient } from '@/sanity/lib/client'
import { studioUrl } from '@/sanity/lib/api'

/**
 * Used to fetch data in Server Components, it has built in support for handling Draft Mode and perspectives.
 */
export async function sanityFetch<Data, Params = AnyVariables>({
  query,
  params = {} as AnyVariables,
  perspective = draftMode().isEnabled ? 'previewDrafts' : 'published',
  /**
   * Stega embedded Content Source Maps are used by Visual Editing by both the Sanity Presentation Tool and Vercel Visual Editing.
   * The Sanity Presentation Tool will enable Draft Mode when loading up the live preview, and we use it as a signal for when to embed source maps.
   * When outside of the Sanity Studio we also support the Vercel Toolbar Visual Editing feature, which is only enabled in production when it's a Vercel Preview Deployment.
   */
  stega = perspective === 'previewDrafts' ||
    process.env.VERCEL_ENV === 'preview',
}: {
  query: DocumentInput<Data, Params>
  params?: AnyVariables
  perspective?: Omit<ClientPerspective, 'raw'>
  stega?: boolean
}) {
  const client = getClient(perspective, stega)
  const result = await client.query<Data>(query, params)

  if (
    stega &&
    result.data &&
    typeof result.extensions === 'object' &&
    result.extensions !== null &&
    'sanitySourceMap' in result.extensions
  ) {
    const transcoded = stegaEncodeSourceMap<Data>(
      result.data,
      result.extensions.sanitySourceMap as ContentSourceMap,
      {
        enabled: true,
        studioUrl,
        logger: console,
        filter: (props) => {
          if (props.sourcePath.at(-1) === 'title') {
            return true
          }

          return props.filterDefault(props)
        },
      },
    )
    return { ...result, data: transcoded }
  }

  return result
}
