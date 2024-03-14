import { defineCliConfig } from 'sanity/cli'

import { projectId, dataset, graphqlTag } from '@/sanity/lib/api'

export default defineCliConfig({
  api: { projectId, dataset },
  /**
   * https://www.sanity.io/docs/graphql#04501f1778aa
   */
  graphql: [
    {
      playground: true,
      tag: graphqlTag,
    },
  ],
})
