import type { Metadata, ResolvingMetadata } from 'next'
import { groq } from 'next-sanity'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'

import Avatar from '../../avatar'
import CoverImage from '../../cover-image'
import DateComponent from '../../date'
import MoreStories from '../../more-stories'
import PortableText from '../../portable-text'

import { sanityFetchLegacy, sanityFetch } from '@/sanity/lib/fetch'
import {
  type PostQueryResponse,
  type SettingsQueryResponse,
  postQuery,
  settingsQuery,
} from '@/sanity/lib/queries'
import { resolveOpenGraphImage } from '@/sanity/lib/utils'
import * as demo from '@/sanity/lib/demo'
import { gql } from '@urql/core'

type Props = {
  params: { slug: string }
}

export async function generateStaticParams() {
  return sanityFetchLegacy<{ slug: string }[]>({
    query: groq`*[_type == "post" && defined(slug.current)]{"slug": slug.current}`,
    perspective: 'published',
    stega: false,
  })
}

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const post = await sanityFetchLegacy<PostQueryResponse>({
    query: postQuery,
    params,
    stega: false,
  })
  const previousImages = (await parent).openGraph?.images || []
  const ogImage = resolveOpenGraphImage(post?.coverImage)

  return {
    authors: post?.author?.name ? [{ name: post?.author?.name }] : [],
    title: post?.title,
    description: post?.excerpt,
    openGraph: {
      images: ogImage ? [ogImage, ...previousImages] : previousImages,
    },
  } satisfies Metadata
}

const SettingsQuery = gql`
  query {
    allSettings {
      results {
        id
        name
      }
    }
  }
`

export default async function PostPage({ params }: Props) {
  const [post, settings] = await Promise.all([
    sanityFetchLegacy<PostQueryResponse>({
      query: postQuery,
      params,
    }),
    sanityFetchLegacy<SettingsQueryResponse>({
      query: settingsQuery,
    }),
  ])
  const settings2 = await sanityFetch({ query: SettingsQuery })
  console.log(settings2)

  if (!post?._id) {
    return notFound()
  }

  return (
    <div className="container mx-auto px-5">
      <h2 className="mb-16 mt-10 text-2xl font-bold leading-tight tracking-tight md:text-4xl md:tracking-tighter">
        <Link href="/" className="hover:underline">
          {settings?.title || demo.title}
        </Link>
      </h2>
      <article>
        <h1 className="mb-12 text-balance text-6xl font-bold leading-tight tracking-tighter md:text-7xl md:leading-none lg:text-8xl">
          {post.title}
        </h1>
        <div className="hidden md:mb-12 md:block">
          {post.author && (
            <Avatar name={post.author.name} picture={post.author.picture} />
          )}
        </div>
        <div className="mb-8 sm:mx-0 md:mb-16">
          <CoverImage image={post.coverImage} priority />
        </div>
        <div className="mx-auto max-w-2xl">
          <div className="mb-6 block md:hidden">
            {post.author && (
              <Avatar name={post.author.name} picture={post.author.picture} />
            )}
          </div>
          <div className="mb-6 text-lg">
            <div className="mb-4 text-lg">
              <DateComponent dateString={post.date} />
            </div>
          </div>
        </div>
        {post.content?.length && (
          <PortableText className="mx-auto max-w-2xl" value={post.content} />
        )}
      </article>
      <aside>
        <hr className="border-accent-2 mb-24 mt-28" />
        <h2 className="mb-8 text-6xl font-bold leading-tight tracking-tighter md:text-7xl">
          Recent Stories
        </h2>
        <Suspense>
          <MoreStories skip={post._id} limit={2} />
        </Suspense>
      </aside>
    </div>
  )
}
