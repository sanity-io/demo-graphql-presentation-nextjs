/**
 * Using this file to declare types for urql that are available on the `OperationContext`,
 * this adds typings for the `useQuery` and `client.query` methods for options that are
 * used by the `sanityExchange` URQL exchange
 */

import { OperationContext } from '@urql/core'
import type { ClientPerspective } from '@sanity/client'

declare module '@urql/core' {
  interface OperationContext {
    perspective?: Exclude<ClientPerspective, 'raw'>
    stega?: boolean
  }
}
