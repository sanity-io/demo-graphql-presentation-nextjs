import type { InferGetStaticPropsType } from 'next'
import { useQuery } from 'urql'
import { Suspense } from 'react'

import * as demo from '@/sanity/lib/demo'
import { defineGetStaticProps } from '@/components/UrqlProvider'
import {
  HeroQuery,
  SettingsQuery,
  type PostFragmentType,
} from '@/sanity/lib/queries'
// import Avatar from '@/app/(blog)/avatar'
import CoverImage from '@/components/CoverImage'
import DateComponent from '@/app/(blog)/date'
import PortableText from '@/app/(blog)/portable-text'
import Link from 'next/link'

export const getStaticProps = defineGetStaticProps(async (client) => {
  await Promise.all([
    client.query(SettingsQuery, {}).toPromise(),
    client.query(HeroQuery, {}).toPromise(),
  ])
})

export default function Page(
  props: InferGetStaticPropsType<typeof getStaticProps>,
) {
  const [_settings] = useQuery({ query: SettingsQuery })
  const [allPost] = useQuery({ query: HeroQuery })
  const settings = _settings.data?.Settings
  const heroPost = allPost.data?.allPost?.[0]

  console.log(props, { settings, heroPost })
  return (
    <div className="container mx-auto px-5">
      <Intro title={settings?.title} description={settings?.descriptionRaw} />
      {heroPost ? (
        <HeroPost
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
  title,
  slug,
  excerpt,
  coverImage,
  date,
  _updatedAt,
  author,
}: Pick<
  PostFragmentType,
  'title' | 'coverImage' | 'date' | '_updatedAt' | 'excerpt' | 'author' | 'slug'
>) {
  return (
    <article>
      <Link
        className="group mb-8 block md:mb-16"
        href={`/posts/${slug.current}`}
      >
        <CoverImage image={coverImage} priority />
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
          {/* {author?.name && (
            <Avatar name={author.name} picture={author.picture} />
          )} */}
        </div>
      </div>
    </article>
  )
}

function MoreStories(props: any): JSX.Element {
  return <>hi</>
}

function Onboarding(props: any): JSX.Element {
  return <>hi</>
}
