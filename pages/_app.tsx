import '@/app/(blog)/globals.css'

import { VisualEditing } from '@sanity/visual-editing/next-pages-router'
import type { AppProps } from 'next/app'
import { Inter } from 'next/font/google'
import {
  UrqlProvider,
  useRevalidate,
  type UrqlProviderProps,
} from '@/components/UrqlProvider'

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
})

export interface SharedPageProps
  extends Pick<UrqlProviderProps, 'draftMode' | 'token' | 'urqlState'> {}

export default function App(props: AppProps<SharedPageProps>) {
  const { Component } = props
  const { token = '', urqlState, ...pageProps } = props.pageProps
  const { draftMode = false } = pageProps
  const { refresh, setRevalidate } = useRevalidate()
  return (
    <>
      <main className={`${inter.className} min-h-screen bg-white text-black`}>
        <UrqlProvider
          draftMode={draftMode}
          token={token}
          urqlState={urqlState}
          setRevalidate={setRevalidate}
        >
          <Component {...pageProps} />
        </UrqlProvider>
      </main>
      {draftMode && <VisualEditing refresh={refresh} />}
    </>
  )
}
