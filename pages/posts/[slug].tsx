import { createClient, gql } from '@urql/core'
import type { GetStaticPaths, InferGetStaticPropsType } from 'next'
import ErrorComponent from 'next/error'
import Link from 'next/link'
import { useQuery } from 'urql'

import Avatar from '@/components/avatar'
import CoverImage from '@/components/cover-image'
import DateComponent from '@/components/date'
import Footer from '@/components/footer'
import MoreStories from '@/components/more-stories'
import PortableText from '@/components/portable-text'
import { defineGetStaticProps } from '@/components/urql-provider'
import { getClientOptions } from '@/sanity/lib/client'
import * as demo from '@/sanity/lib/demo'
import {
  MoreStoriesQuery,
  PostQuery,
  SettingsQuery,
  type MoreStoriesQueryData,
  type PostQueryData,
  type SettingsQueryData,
} from '@/sanity/lib/queries'
import { defineDataAttribute } from '@/sanity/lib/utils'

export const getStaticPaths: GetStaticPaths = async () => {
  const client = createClient(
    getClientOptions({
      perspective: 'published',
      stega: false,
    }),
  )
  const { data } = await client
    .query<{
      allPost: { slug: { current: string } }[]
    }>(
      gql`
        query {
          allPost(where: { slug: { current: { neq: null } } }) {
            slug {
              current
            }
          }
        }
      `,
      {},
    )
    .toPromise()
  return {
    paths: data?.allPost.map(({ slug }) => `/posts/${slug.current}`) || [],
    fallback: 'blocking',
  }
}

const limit = 2
export const getStaticProps = defineGetStaticProps<
  { slug: string },
  { slug: string | string[] }
>(async (client, ctx) => {
  const slug = Array.isArray(ctx.params?.slug)
    ? ctx.params.slug[0]
    : ctx.params?.slug
  if (!slug) {
    return { notFound: true }
  }
  const [post] = await Promise.all([
    client.query<PostQueryData>(PostQuery, { slug }).toPromise(),
    client.query(SettingsQuery, {}).toPromise(),
  ])
  if (!post.data?.allPost?.length) {
    return { notFound: true }
  }
  if (post.data?.allPost?.[0]?._id) {
    await client
      .query(MoreStoriesQuery, { limit, skip: post.data.allPost[0]._id })
      .toPromise()
  }
  return { props: { slug } }
})

export default function Page(
  props: InferGetStaticPropsType<typeof getStaticProps>,
) {
  console.log({ props })
  const { slug } = props
  const [_post] = useQuery<PostQueryData>({
    query: PostQuery,
    variables: { slug },
  })
  const [_settings] = useQuery<SettingsQueryData>({ query: SettingsQuery })
  const post = _post.data?.allPost?.[0]
  const settings = _settings.data?.Settings
  const skip = post?._id
  const [moreStories] = useQuery<MoreStoriesQueryData>({
    query: MoreStoriesQuery,
    variables: { limit, skip },
    pause: !skip,
  })

  // This might happen during Preview Mode, as you can rename a slug while looking at a page
  if (!post?._id) {
    return <ErrorComponent statusCode={404} />
  }

  const dataAttribute = defineDataAttribute({ id: post._id, type: 'post' })

  return (
    <>
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
            <PortableText
              className="mx-auto max-w-2xl"
              value={post.contentRaw}
            />
          )}
        </article>
        {moreStories.data?.allPost && (
          <aside>
            <hr className="border-accent-2 mb-24 mt-28" />
            <h2 className="mb-8 text-6xl font-bold leading-tight tracking-tighter md:text-7xl">
              Recent Stories
            </h2>
            <MoreStories data={moreStories.data} />
          </aside>
        )}
      </div>
      <Footer settings={settings} />
    </>
  )
}
