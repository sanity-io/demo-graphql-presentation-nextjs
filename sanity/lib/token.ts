import * as React from 'react'

export const token = process.env.SANITY_API_READ_TOKEN as string

if (typeof window === 'undefined' && !token) {
  throw new Error('Missing SANITY_API_READ_TOKEN')
}

React.experimental_taintUniqueValue?.(
  'Do not pass the sanity API read token to the client.',
  process,
  token,
)
