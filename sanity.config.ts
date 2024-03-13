'use client'
/**
 * This config is used to set up Sanity Studio that's mounted on the `app/(sanity)/studio/[[...tool]]/page.tsx` route
 */
import { visionTool } from '@sanity/vision'
import { type PluginOptions, defineConfig, definePlugin } from 'sanity'
import { unsplashImageAsset } from 'sanity-plugin-asset-source-unsplash'
import { presentationTool } from 'sanity/presentation'
import { structureTool } from 'sanity/structure'

import {
  apiVersion,
  dataset,
  graphqlWorkspace,
  projectId,
  studioUrl,
} from '@/sanity/lib/api'
import { defineLocate } from '@/sanity/plugins/locate'
import { pageStructure, singletonPlugin } from '@/sanity/plugins/settings'
import { assistWithPresets } from '@/sanity/plugins/assist'
import author from '@/sanity/schemas/documents/author'
import post from '@/sanity/schemas/documents/post'
import settings from '@/sanity/schemas/singletons/settings'

const sharedSettings = definePlugin({
  name: 'sharedSettings',
  schema: {
    types: [
      // Singletons
      settings,
      // Documents
      post,
      author,
    ],
  },
  plugins: [
    structureTool({ structure: pageStructure([settings]) }),
    // Configures the global "new document" button, and document actions, to suit the Settings document singleton
    singletonPlugin([settings.name]),
    // Add an image asset source for Unsplash
    unsplashImageAsset(),
    // Sets up AI Assist with preset prompts
    // https://www.sanity.io/docs/ai-assist
    // assistWithPresets(),
    // Vision lets you query your content with GROQ in the studio
    // https://www.sanity.io/docs/the-vision-plugin
    process.env.NODE_ENV === 'development' &&
      visionTool({ defaultApiVersion: apiVersion }),
  ].filter(Boolean) as PluginOptions[],
})

const pagesRouterWorkspaceName = 'pages-router'

export default defineConfig([
  {
    name: graphqlWorkspace,
    basePath: `${studioUrl.baseUrl}/${studioUrl.workspace}`,
    projectId,
    dataset,
    plugins: [
      presentationTool({
        locate: defineLocate('/'),
        previewUrl: { preview: '/', previewMode: { enable: '/api/draft' } },
      }),
      sharedSettings(),
    ],
  },
  {
    name: pagesRouterWorkspaceName,
    basePath: `${studioUrl.baseUrl}/${pagesRouterWorkspaceName}`,
    projectId,
    dataset,
    plugins: [
      presentationTool({
        locate: defineLocate(`/${pagesRouterWorkspaceName}/`),
        previewUrl: {
          preview: `/${pagesRouterWorkspaceName}`,
          previewMode: { enable: '/api/draft' },
        },
      }),
      sharedSettings(),
    ],
  },
])
