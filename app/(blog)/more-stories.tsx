import Link from 'next/link'

import Avatar from './avatar'
import CoverImage from './cover-image'
import DateComponent from './date'

import { sanityFetch } from '@/sanity/lib/fetch'
import {
  MoreStoriesQuery,
  type MoreStoriesQueryData,
} from '@/sanity/lib/queries'
import { defineDataAttribute } from '@/sanity/lib/utils'

export default async function MoreStories(params: {
  skip: string
  limit: number
}) {
  const _data = await sanityFetch<MoreStoriesQueryData>({
    query: MoreStoriesQuery,
    params,
  })
  const data = Array.isArray(_data.data?.allPost) ? _data.data.allPost : []

  return (
    <>
      <div className="mb-32 grid grid-cols-1 gap-y-20 md:grid-cols-2 md:gap-x-16 md:gap-y-32 lg:gap-x-32">
        {data?.map((post) => {
          const { _id, title, slug, coverImage, excerpt, author } = post
          const dataAttribute = defineDataAttribute({ id: _id, type: 'post' })
          return (
            <article key={_id}>
              <Link
                href={`/posts/${slug.current}`}
                className="group mb-5 block"
              >
                <CoverImage
                  data-sanity={dataAttribute('coverImage')}
                  image={coverImage}
                  priority={false}
                />
              </Link>
              <h3 className="mb-3 text-balance text-3xl leading-snug">
                <Link
                  href={`/posts/${slug.current}`}
                  className="hover:underline"
                >
                  {title || 'Untitled'}
                </Link>
              </h3>
              <div className="mb-4 text-lg">
                <DateComponent dateString={post.date || post._updatedAt} />
              </div>
              {excerpt && (
                <p className="mb-4 text-pretty text-lg leading-relaxed">
                  {excerpt}
                </p>
              )}
              {author?.name && (
                <Avatar name={author.name} picture={author.picture} />
              )}
            </article>
          )
        })}
      </div>
    </>
  )
}
