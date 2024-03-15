import Link from 'next/link'
import { Suspense } from 'react'

import Avatar from './avatar'
import CoverImage from './cover-image'
import DateComponent from './date'
import MoreStories from './more-stories'
import Onboarding from './onboarding'
import PortableText from './portable-text'

import * as demo from '@/sanity/lib/demo'
import { sanityFetch } from '@/sanity/lib/fetch'
import {
  HeroQuery,
  SettingsQuery,
  type HeroQueryData,
  type PostFragmentType,
  type SettingsQueryData,
} from '@/sanity/lib/queries'
import { defineDataAttribute } from '@/sanity/lib/utils'

function Intro(props: { title: string | null | undefined; description: any }) {
  const title = props.title || demo.title
  const description = props.description?.length
    ? props.description
    : demo.description
  return (
    <section className="mb-16 mt-16 flex flex-col items-center lg:mb-12 lg:flex-row lg:justify-between">
      <h1 className="text-balance text-6xl font-bold leading-tight tracking-tighter lg:pr-8 lg:text-8xl">
        {title || demo.title}
      </h1>
      <h2 className="mt-5 text-pretty text-center text-lg lg:pl-8 lg:text-left">
        <PortableText
          className="prose-lg"
          value={description?.length ? description : demo.description}
        />
      </h2>
    </section>
  )
}

function HeroPost({
  _id,
  title,
  slug,
  excerpt,
  coverImage,
  date,
  _updatedAt,
  author,
}: Pick<
  PostFragmentType,
  | '_id'
  | 'title'
  | 'coverImage'
  | 'date'
  | '_updatedAt'
  | 'excerpt'
  | 'author'
  | 'slug'
>) {
  const dataAttribute = defineDataAttribute({ id: _id, type: 'post' })
  return (
    <article>
      <Link
        className="group mb-8 block md:mb-16"
        href={`/posts/${slug.current}`}
      >
        <CoverImage
          data-sanity={dataAttribute('coverImage')}
          image={coverImage}
          priority
        />
      </Link>
      <div className="mb-20 md:mb-28 md:grid md:grid-cols-2 md:gap-x-16 lg:gap-x-8">
        <div>
          <h3 className="mb-4 text-pretty text-4xl leading-tight lg:text-6xl">
            <Link href={`/posts/${slug.current}`} className="hover:underline">
              {title || 'Untitled'}
            </Link>
          </h3>
          <div className="mb-4 text-lg md:mb-0">
            <DateComponent dateString={date || _updatedAt} />
          </div>
        </div>
        <div>
          {excerpt && (
            <p className="mb-4 text-pretty text-lg leading-relaxed">
              {excerpt}
            </p>
          )}
          {author?.name && (
            <Avatar
              data-sanity={dataAttribute('picture')}
              name={author.name}
              picture={author.picture}
            />
          )}
        </div>
      </div>
    </article>
  )
}

export default async function Page() {
  const [_settings, allPost] = await Promise.all([
    sanityFetch<SettingsQueryData>({ query: SettingsQuery }),
    sanityFetch<HeroQueryData>({ query: HeroQuery }),
  ])
  const settings = _settings.data?.Settings
  const heroPost = allPost.data?.allPost?.[0]

  return (
    <div className="container mx-auto px-5">
      <Intro title={settings?.title} description={settings?.descriptionRaw} />
      {heroPost ? (
        <HeroPost
          _id={heroPost._id}
          title={heroPost.title}
          slug={heroPost.slug}
          coverImage={heroPost.coverImage}
          excerpt={heroPost.excerpt}
          date={heroPost.date}
          _updatedAt={heroPost._updatedAt}
          author={heroPost.author}
        />
      ) : (
        <Onboarding />
      )}
      {heroPost?._id && (
        <aside>
          <h2 className="mb-8 text-6xl font-bold leading-tight tracking-tighter md:text-7xl">
            More Stories
          </h2>
          <Suspense>
            <MoreStories skip={heroPost._id} limit={100} />
          </Suspense>
        </aside>
      )}
    </div>
  )
}
