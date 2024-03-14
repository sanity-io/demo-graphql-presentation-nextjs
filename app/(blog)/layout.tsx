import './globals.css'

import { SpeedInsights } from '@vercel/speed-insights/next'
import type { Metadata } from 'next'
import { type PortableTextBlock, VisualEditing, toPlainText } from 'next-sanity'
import { Inter } from 'next/font/google'
import { draftMode } from 'next/headers'
import { Suspense } from 'react'

import AlertBanner from './alert-banner'
import PortableText from './portable-text'

import * as demo from '@/sanity/lib/demo'
import { sanityFetch } from '@/sanity/lib/fetch'
import { type SettingsQueryData, SettingsQuery } from '@/sanity/lib/queries'
import { resolveOpenGraphImage } from '@/sanity/lib/utils'

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
})

export async function generateMetadata(): Promise<Metadata> {
  const _settings = await sanityFetch<SettingsQueryData>({
    query: SettingsQuery,
    // Metadata should never contain stega
    stega: false,
  })
  const settings = _settings.data?.Settings
  const title = settings?.title || demo.title
  const description = settings?.descriptionRaw || demo.description

  const ogImage = resolveOpenGraphImage(settings?.ogImage)
  // @TODO add support for image fields in GQL
  // let metadataBase: URL | undefined = undefined
  // try {
  // metadataBase = settings?.ogImage?.metadataBase
  // ? new URL(settings.ogImage.metadataBase)
  // : undefined
  // } catch {
  // ignore
  // }
  return {
    // metadataBase,
    title: {
      template: `%s | ${title}`,
      default: title,
    },
    description: toPlainText(description),
    openGraph: {
      images: ogImage ? [ogImage] : [],
    },
  }
}

async function Footer() {
  const _data = await sanityFetch<SettingsQueryData>({
    query: SettingsQuery,
  })
  const data = _data.data?.Settings
  const footer = data?.footerRaw || ([] as PortableTextBlock[])

  return (
    <footer className="bg-accent-1 border-accent-2 border-t">
      <div className="container mx-auto px-5">
        {footer.length > 0 ? (
          <PortableText
            className="prose-sm bottom-0 w-full max-w-none text-pretty bg-white py-12 text-center md:py-20"
            value={footer}
          />
        ) : (
          <div className="flex flex-col items-center py-28 lg:flex-row">
            <h3 className="mb-10 text-center text-4xl font-bold leading-tight tracking-tighter lg:mb-0 lg:w-1/2 lg:pr-4 lg:text-left lg:text-5xl">
              Built with Next.js.
            </h3>
            <div className="flex flex-col items-center justify-center lg:w-1/2 lg:flex-row lg:pl-4">
              <a
                href="https://nextjs.org/docs"
                className="mx-3 mb-6 border border-black bg-black px-12 py-3 font-bold text-white transition-colors duration-200 hover:bg-white hover:text-black lg:mb-0 lg:px-8"
              >
                Read Documentation
              </a>
              <a
                href="https://github.com/sanity-io/demo-graphql-presentation-nextjs#readme"
                className="mx-3 font-bold hover:underline"
              >
                View on GitHub
              </a>
            </div>
          </div>
        )}
      </div>
    </footer>
  )
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} bg-white text-black`}>
      <body>
        <section className="min-h-screen">
          {draftMode().isEnabled && <AlertBanner />}
          <main>{children}</main>
          <Suspense>
            <Footer />
          </Suspense>
        </section>
        {draftMode().isEnabled && <VisualEditing />}
        <SpeedInsights />
      </body>
    </html>
  )
}
