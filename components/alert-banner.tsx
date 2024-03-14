/* eslint-disable @next/next/no-html-link-for-pages */
import { useSyncExternalStore, useState } from 'react'

const emptySubscribe = () => () => {}

export default function AlertBanner() {
  const [pending, setPending] = useState(false)

  const shouldShow = useSyncExternalStore(
    emptySubscribe,
    () => window.top === window,
    () => false,
  )

  if (!shouldShow) return null

  return (
    <div
      className={`${
        pending ? 'animate-pulse' : ''
      } fixed left-0 top-0 z-50 w-full border-b bg-white/95 text-black backdrop-blur`}
    >
      <div className="py-2 text-center text-sm">
        {pending ? (
          'Disabling draft mode...'
        ) : (
          <>
            {'Previewing drafts. '}
            <a
              href="/api/disable-draft"
              className="hover:text-cyan underline transition-colors duration-200"
              onClick={() => {
                setPending(true)
              }}
            >
              Back to published
            </a>
          </>
        )}
      </div>
    </div>
  )
}
