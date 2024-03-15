import '@/components/globals.css'

import { VisualEditing } from '@sanity/visual-editing/next-pages-router'
import type { AppProps } from 'next/app'
import { Inter } from 'next/font/google'
import { SpeedInsights } from '@vercel/speed-insights/next'

import {
  UrqlProvider,
  useRevalidate,
  type RequiredProps,
} from '@/components/urql-provider'
import AlertBanner from '@/components/alert-banner'

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
})

export default function App(props: AppProps<RequiredProps>) {
  const { Component } = props
  const { token, urqlState, ...pageProps } = props.pageProps
  const { draftMode, perspective, stega } = pageProps
  const { refresh, setRevalidate } = useRevalidate()
  return (
    <>
      <main className={`${inter.className} min-h-screen`}>
        {draftMode && <AlertBanner />}
        <UrqlProvider
          perspective={perspective}
          setRevalidate={setRevalidate}
          stega={stega}
          token={token}
          urqlState={urqlState}
        >
          <Component {...pageProps} />
        </UrqlProvider>
      </main>
      {draftMode && <VisualEditing refresh={refresh} />}
      <SpeedInsights />
    </>
  )
}
