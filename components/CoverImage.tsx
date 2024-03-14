import Image from 'next/image'

import type { ImageFragmentType } from '@/sanity/lib/queries'
import { urlForImage } from '@/sanity/lib/utils'

interface CoverImageProps {
  image?: ImageFragmentType | null
  priority?: boolean
}

export default function CoverImage(props: CoverImageProps) {
  const { image: source, priority } = props
  const image = source?.asset?._id ? (
    <Image
      className="h-auto w-full"
      width={2000}
      height={1000}
      // @ts-expect-error alt is not available yet
      alt={source?.alt || ''}
      src={urlForImage(source)?.height(1000).width(2000).url() as string}
      sizes="100vw"
      priority={priority}
    />
  ) : (
    <div className="bg-slate-50" style={{ paddingTop: '50%' }} />
  )

  return (
    <div className="shadow-md transition-shadow duration-200 group-hover:shadow-lg sm:mx-0">
      {image}
    </div>
  )
}
