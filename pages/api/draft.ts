/**
 * This file is used to allow Presentation to set the app in Draft Mode, which will load Visual Editing
 * and query draft content and preview the content as it will appear once everything is published
 */

import { validatePreviewUrl } from '@sanity/preview-url-secret'
import type { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from 'next-sanity'

import { apiVersion, dataset, projectId } from '@/sanity/lib/api'
import { token } from '@/sanity/lib/token'

const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
  token,
})

export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse<string | undefined>,
) {
  if (!req.url) {
    throw new Error('Missing url')
  }
  const { isValid, redirectTo = '/' } = await validatePreviewUrl(
    client,
    req.url,
  )
  if (!isValid) {
    return res.status(401).send('Invalid secret')
  }
  // Enable Draft Mode by setting the cookies
  res.setDraftMode({ enable: true })
  res.writeHead(307, { Location: redirectTo })
  res.end()
}
