/**
 * This file is used to allow Presentation to set the app in Draft Mode, which will load Visual Editing
 * and query draft content and preview the content as it will appear once everything is published
 */

import { createClient } from 'next-sanity'
import { defineEnableDraftMode } from 'next-sanity/draft-mode'

import { apiVersion, dataset, projectId } from '@/sanity/lib/api'
import { token } from '@/sanity/lib/token'

const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
  token,
})

export const { GET } = defineEnableDraftMode({ client })
