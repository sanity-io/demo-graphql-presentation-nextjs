/**
 * Why are we using a custom provider instead of `import { withUrqlClient } from 'next-urql'`?
 * To allow passing down `draftMode` and `token` from `getStaticProps` and use it
 * to reconfigure the client, set its Authorization header so it can query draft content with
 * `perspective=previewDrafts`.
 */

import type { ParsedUrlQuery } from 'querystring'
import type { ClientPerspective } from 'next-sanity'
import { type Client, type ClientOptions, createClient } from '@urql/core'
import { useCallback, useEffect, useMemo, useReducer, useState } from 'react'
import {
  Provider,
  type SSRExchange,
  ssrExchange,
  cacheExchange,
  fetchExchange,
  type SSRData,
} from 'urql'
import type { WithUrqlClientOptions } from 'next-urql'

import { defineClientUrl } from '@/sanity/lib/client'
import type { HistoryRefresh } from '@sanity/visual-editing/next-pages-router'
import type {
  GetStaticProps,
  GetStaticPropsContext,
  GetStaticPropsResult,
} from 'next'
import { token as _token } from '@/sanity/lib/token'

export interface UrqlProviderProps
  extends Pick<WithUrqlClientOptions, 'staleWhileRevalidate'> {
  children: React.ReactNode
  draftMode: boolean
  token: string
  urqlState: SSRData | undefined
  setRevalidate: React.Dispatch<React.SetStateAction<(() => void) | undefined>>
}

/**
 * Since we're using `getStaticProps` we cannot use suspense features, as we're unable to run everything in a `react-ssr-prepass` prepass.
 */
const canEnableSuspense = false

let ssr: SSRExchange
export function UrqlProvider(props: UrqlProviderProps) {
  const {
    children,
    staleWhileRevalidate,
    urqlState: urqlServerState,
    draftMode,
    token,
    setRevalidate,
  } = props
  const [version, forceUpdate] = useReducer((prev) => prev + 1, 0)
  /**
   * Content Source Maps are needed in Draft Mode for Sanity Presentation,
   * and for Vercel Visual Editing on Preview Deployments (checked using NEXT_PUBLIC_VERCEL_ENV).
   */
  const resultSourceMap =
    draftMode || process.env.NEXT_PUBLIC_VERCEL_ENV === 'preview'

  const client = useMemo(() => {
    if (!ssr || typeof window === 'undefined') {
      // We want to force the cache to hydrate, we do this by setting the isClient flag to true
      ssr = ssrExchange({
        initialState: urqlServerState,
        isClient: true,
        staleWhileRevalidate:
          typeof window !== 'undefined' ? staleWhileRevalidate : undefined,
      })
    } else if (!version) {
      ssr.restoreData(urqlServerState!)
    }

    const clientConfig = getClientConfig(
      ssr,
      draftMode ? 'previewDrafts' : 'published',
      resultSourceMap,
      token,
    )
    return initUrqlClient(clientConfig, canEnableSuspense)
  }, [
    draftMode,
    resultSourceMap,
    staleWhileRevalidate,
    token,
    urqlServerState,
    version,
  ])

  useEffect(() => {
    setRevalidate(() => () => {
      resetClient()
      ssr = ssrExchange({ initialState: undefined })
      forceUpdate()
    })
    return () => setRevalidate(undefined)
  }, [setRevalidate])

  return <Provider value={client}>{children}</Provider>
}

const getClientConfig = (
  ssr: SSRExchange,
  perspective: Omit<ClientPerspective, 'raw'>,
  resultSourceMap: boolean,
  token: string,
) => {
  return {
    url: defineClientUrl({
      useCdn: perspective === 'published',
      perspective,
      resultSourceMap,
    }),
    exchanges: [cacheExchange, ssr, fetchExchange],
    fetchOptions: token
      ? {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      : {},
  } satisfies ClientOptions
}

type RequiredProps = Pick<
  UrqlProviderProps,
  'draftMode' | 'token' | 'urqlState'
>
/**
 * Defines a getStaticProps function that is compatible with the `UrqlProvider` and how it performs SSR hydration.
 */
export function defineGetStaticProps<
  Props extends { [key: string]: any } = { [key: string]: any },
  Params extends ParsedUrlQuery = ParsedUrlQuery,
>(
  handler: (
    client: Client,
    ctx: GetStaticPropsContext<Params>,
  ) => Promise<GetStaticPropsResult<Props> | void>,
) {
  return (async (ctx) => {
    const { draftMode = false } = ctx
    const token = draftMode ? _token : ''

    const ssrCache = ssrExchange({ isClient: false, initialState: undefined })
    const client = initUrqlClient(
      getClientConfig(
        ssrCache,
        draftMode ? 'previewDrafts' : 'published',
        /**
         * Content Source Maps are needed in Draft Mode for Sanity Presentation,
         * and for Vercel Visual Editing on Preview Deployments (checked using NEXT_PUBLIC_VERCEL_ENV).
         */
        draftMode || process.env.NEXT_PUBLIC_VERCEL_ENV === 'preview',
        token,
      ),
      canEnableSuspense,
    )

    // When using the `published` perspective we use time-based revalidation to match the time-to-live on Sanity's API CDN (30 seconds)
    // https://www.sanity.io/docs/graphql#f79d83e447f8
    let revalidate: number | boolean | undefined = draftMode ? undefined : 30
    const result = await handler(client, ctx)
    // Handle 404
    if (result && 'notFound' in result) {
      return { revalidate, ...result }
    }
    // Handle redirects
    if (result && 'redirect' in result) {
      return { revalidate, ...result }
    }
    // Allow the handler to override the revalidate value
    if (result && 'revalidate' in result) {
      revalidate = result.revalidate
    }

    const extraProps = result && 'props' in result ? result.props : {}
    const requiredProps = {
      draftMode,
      token,
      urqlState: ssrCache.extractData(),
    } satisfies RequiredProps
    return { revalidate, props: { ...extraProps, ...requiredProps } }
  }) as GetStaticProps<RequiredProps & Props, Params>
}

/**
 * This hook ties together the UrqlProvider and the `refresh` event in
 * `import {VisualEditing} from '@sanity/visual-editing/next-pages-router'
 * And makes it so URQL refetches queries whenever a mutation or a manual refresh is triggered.
 */
export function useRevalidate() {
  const [revalidate, setRevalidate] = useState<(() => void) | undefined>()
  const refresh = useCallback<
    (payload: HistoryRefresh) => false | Promise<void>
  >(
    (payload) => {
      if (!revalidate) {
        console.debug('Ignoring refresh, revalidate is not set', payload)
        return false
      }
      switch (payload.source) {
        case 'manual':
        case 'mutation':
          return new Promise((resolve) => {
            revalidate()
            // URQL isn't setup to track refresh progress, so we return a mock promise that shows the
            // spinner UI in Sanity Presentation for 1s
            setTimeout(resolve, 1000)
          })
        default:
          console.debug('Ignoring refresh, unknown source', payload)
          return false
      }
    },
    [revalidate],
  )
  return { refresh, setRevalidate }
}

// useQuery (handles stega)

/**
 * The `resetClient` and `initUrqlClient` functions are originally from:
 * https://github.com/urql-graphql/urql/blob/c37a0fc304dd29bfa730e7bd395343200a857b5d/packages/next-urql/src/init-urql-client.ts
 * And they're copied in here as the `resetClient` function is not exported.
 */
let urqlClient: Client | null = null

/** Resets the `Client` that {@link initUrqlClient} returns.
 *
 * @remarks
 * `resetClient` will force {@link initUrqlClient} to create a new
 * {@link Client}, rather than reusing the same `Client` it already
 * created on the client-side.
 *
 * This may be used to force the cache and any state in the `Client`
 * to be cleared and reset.
 */
function resetClient() {
  urqlClient = null
}

/** Creates a {@link Client} the given options.
 *
 * @param clientOptions - {@link ClientOptions} to create the `Client` with.
 * @param canEnableSuspense - Enables React Suspense on the server-side for `react-ssr-prepass`.
 * @returns the created {@link Client}
 *
 * @remarks
 * `initUrqlClient` creates a {@link Client} with the given options,
 * like {@link createClient} does, but reuses the same client when
 * run on the client-side.
 *
 * As long as `canEnableSuspense` is set to `true`, it enables React Suspense
 * mode on the server-side for `react-ssr-prepass`.
 */
function initUrqlClient(
  clientOptions: ClientOptions,
  canEnableSuspense: boolean,
): Client {
  // Create a new Client for every server-side rendered request.
  // This ensures we reset the state for each rendered page.
  // If there is an exising client instance on the client-side, use it.
  const isServer = typeof window === 'undefined'
  if (isServer || !urqlClient) {
    urqlClient = createClient({
      ...clientOptions,
      suspense: canEnableSuspense && (isServer || clientOptions.suspense),
    })
    // Serialize the urqlClient to null on the client-side.
    // This ensures we don't share client and server instances of the urqlClient.
    ;(urqlClient as any).toJSON = () => null
  }

  // Return both the Client instance and the ssrCache.
  return urqlClient
}
