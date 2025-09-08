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
  perspective: _perspective,
  /**
   * Stega embedded Content Source Maps are used by Visual Editing by both the Sanity Presentation Tool and Vercel Visual Editing.
   * The Sanity Presentation Tool will enable Draft Mode when loading up the live preview, and we use it as a signal for when to embed source maps.
   * When outside of the Sanity Studio we also support the Vercel Toolbar Visual Editing feature, which is only enabled in production when it's a Vercel Preview Deployment.
   */
  stega: _stega,
}: {
  query: DocumentInput<Data, Params>
  params?: AnyVariables
  perspective?: Omit<ClientPerspective, 'raw'>
  stega?: boolean
}) {
  const perspective =
    (_perspective ?? (await draftMode()).isEnabled) ? 'drafts' : 'published'
  const stega =
    _stega ?? (perspective === 'drafts' || process.env.VERCEL_ENV === 'preview')
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
          // @TODO customize stega filter here
          return props.filterDefault(props)
        },
      },
    )
    return { ...result, data: transcoded }
  }

  return result
}
