export const token = process.env.SANITY_API_READ_TOKEN as string

if (typeof window === 'undefined' && !token) {
  throw new Error('Missing SANITY_API_READ_TOKEN')
}
