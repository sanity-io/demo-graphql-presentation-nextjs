import { gql } from '@urql/core'
import type { Metadata, ResolvingMetadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'

import Avatar from '../../avatar'
import CoverImage from '../../cover-image'
import DateComponent from '../../date'
import MoreStories from '../../more-stories'
import PortableText from '../../portable-text'

import * as demo from '@/sanity/lib/demo'
import { sanityFetch } from '@/sanity/lib/fetch'
import {
  PostQuery,
  SettingsQuery,
  type PostQueryData,
  type SettingsQueryData,
} from '@/sanity/lib/queries'
import { defineDataAttribute, resolveOpenGraphImage } from '@/sanity/lib/utils'

type Props = {
  params: { slug: string }
}

export async function generateStaticParams() {
  const { data } = await sanityFetch<{
    allPost: { slug: { current: string } }[]
  }>({
    query: gql`
      query {
        allPost(where: { slug: { current: { neq: null } } }) {
          slug {
            current
          }
        }
      }
    `,
    perspective: 'published',
    stega: false,
  })
  return data?.allPost.map(({ slug }) => ({ slug: slug.current })) || []
}

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const _post = await sanityFetch<PostQueryData>({
    query: PostQuery,
    params,
    stega: false,
  })
  const post = _post.data?.allPost?.[0]
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

export default async function PostPage({ params }: Props) {
  const [_post, _settings] = await Promise.all([
    sanityFetch<PostQueryData>({
      query: PostQuery,
      params,
    }),
    sanityFetch<SettingsQueryData>({
      query: SettingsQuery,
    }),
  ])
  const post = _post.data?.allPost?.[0]
  const settings = _settings.data?.Settings

  if (!post?._id) {
    return notFound()
  }

  const dataAttribute = defineDataAttribute({ id: post._id, type: 'post' })

  return (
    <div className="container mx-auto px-5">
      <h2 className="mb-16 mt-10 text-2xl font-bold leading-tight tracking-tight md:text-4xl md:tracking-tighter">
        <Link href="/" className="hover:underline">
          {settings?.title || demo.title}
        </Link>
      </h2>
      <article>
        <h1 className="mb-12 text-balance text-6xl font-bold leading-tight tracking-tighter md:text-7xl md:leading-none lg:text-8xl">
          {post.title || 'Untitled'}
        </h1>
        <div className="hidden md:mb-12 md:block">
          {post.author?.name && (
            <Avatar
              data-sanity={dataAttribute('picture')}
              name={post.author.name}
              picture={post.author.picture}
            />
          )}
        </div>
        <div className="mb-8 sm:mx-0 md:mb-16">
          <CoverImage
            data-sanity={dataAttribute('coverImage')}
            image={post.coverImage}
            priority
          />
        </div>
        <div className="mx-auto max-w-2xl">
          <div className="mb-6 block md:hidden">
            {post.author?.name && (
              <Avatar name={post.author.name} picture={post.author.picture} />
            )}
          </div>
          <div className="mb-6 text-lg">
            <div className="mb-4 text-lg">
              <DateComponent dateString={post.date || post._updatedAt} />
            </div>
          </div>
        </div>
        {post.contentRaw?.length && (
          <PortableText className="mx-auto max-w-2xl" value={post.contentRaw} />
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
