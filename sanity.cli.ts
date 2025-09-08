import { defineCliConfig } from 'sanity/cli'
import { loadEnvConfig } from '@next/env'

const projectDir = process.cwd()
loadEnvConfig(projectDir)

const { projectId, dataset, graphqlTag } = require('@/sanity/lib/api')

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
