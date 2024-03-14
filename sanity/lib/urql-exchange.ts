import {
  type Exchange,
  makeOperation,
  type Operation,
  type OperationResult,
} from '@urql/core'
import { map, pipe } from 'wonka'
import { stegaEncodeSourceMap } from '@sanity/client/stega'
import type {
  StegaConfig,
  ClientPerspective,
  ContentSourceMap,
} from '@sanity/client'

export interface SanityExchangeConfig
  extends Pick<StegaConfig, 'logger' | 'filter'> {
  /**
   * @defaultValue 'published'
   */
  perspective?: Exclude<ClientPerspective, 'raw'>
  stega?: boolean
  studioUrl: Exclude<StegaConfig['studioUrl'], undefined>
}

const apiCdnDomain = 'apicdn.sanity.io'
const apiDomain = 'api.sanity.io'

export const sanityExchange =
  (config: SanityExchangeConfig): Exchange =>
  ({ forward }) => {
    const { studioUrl, filter, logger } = config

    const processIncomingOp = (operation: Operation): Operation => {
      if (operation.kind !== 'query') {
        return operation
      }

      const { stega = config.stega, perspective = config.perspective } =
        operation.context
      const useCdn = perspective !== 'previewDrafts' && !stega

      const url = new URL(
        useCdn
          ? operation.context.url.replace(`.${apiDomain}/`, `.${apiCdnDomain}/`)
          : operation.context.url.replace(
              `.${apiCdnDomain}/`,
              `.${apiDomain}/`,
            ),
      )
      if (perspective) {
        url.searchParams.set('perspective', perspective)
      }
      if (stega) {
        url.searchParams.set('resultSourceMap', 'true')
      }
      return makeOperation(operation.kind, operation, {
        ...operation.context,
        url: url.toString(),
      })
    }

    const processIncomingResult = (
      result: OperationResult,
    ): OperationResult => {
      if (result.operation.kind !== 'query') {
        return result
      }

      const { stega = config.stega } = result.operation.context

      if (
        stega &&
        result.data &&
        typeof result.extensions === 'object' &&
        result.extensions !== null &&
        'sanitySourceMap' in result.extensions
      ) {
        const transcoded = stegaEncodeSourceMap<any>(
          result.data,
          result.extensions.sanitySourceMap as ContentSourceMap,
          {
            enabled: true,
            studioUrl,
            // logger,
            filter,
          },
        )
        return { ...result, data: transcoded }
      }

      return result
    }

    return (ops$) => {
      return pipe(
        forward(pipe(ops$, map(processIncomingOp))),
        map(processIncomingResult),
      )
    }
  }
