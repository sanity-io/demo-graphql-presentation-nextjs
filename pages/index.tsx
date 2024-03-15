import type { InferGetStaticPropsType } from 'next'
import Link from 'next/link'
import { useQuery } from 'urql'

import Avatar from '@/components/avatar'
import CoverImage from '@/components/cover-image'
import DateComponent from '@/components/date'
import Footer from '@/components/footer'
import MoreStories from '@/components/more-stories'
import Onboarding from '@/components/onboarding'
import PortableText from '@/components/portable-text'
import { defineGetStaticProps } from '@/components/urql-provider'
import * as demo from '@/sanity/lib/demo'
import {
  HeroQuery,
  SettingsQuery,
  type PostFragmentType,
  type SettingsQueryData,
  type HeroQueryData,
  MoreStoriesQuery,
  type MoreStoriesQueryData,
} from '@/sanity/lib/queries'
import { defineDataAttribute } from '@/sanity/lib/utils'

const limit = 100
export const getStaticProps = defineGetStaticProps(async (client) => {
  const [heroPost] = await Promise.all([
    client.query<HeroQueryData>(HeroQuery, {}).toPromise(),
    client.query(SettingsQuery, {}).toPromise(),
  ])
  if (heroPost.data?.allPost?.[0]?._id) {
    await client
      .query(MoreStoriesQuery, { limit, skip: heroPost.data.allPost[0]._id })
      .toPromise()
  }
})

export default function Page(
  props: InferGetStaticPropsType<typeof getStaticProps>,
) {
  console.log({ props })
  const [allPost] = useQuery<HeroQueryData>({ query: HeroQuery })
  const [_settings] = useQuery<SettingsQueryData>({ query: SettingsQuery })
  const heroPost = allPost.data?.allPost?.[0]
  const settings = _settings.data?.Settings
  const skip = heroPost?._id
  const [moreStories] = useQuery<MoreStoriesQueryData>({
    query: MoreStoriesQuery,
    variables: { limit, skip },
    pause: !skip,
  })

  return (
    <>
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
        {moreStories.data?.allPost && (
          <aside>
            <h2 className="mb-8 text-6xl font-bold leading-tight tracking-tighter md:text-7xl">
              More Stories
            </h2>
            <MoreStories data={moreStories.data} />
          </aside>
        )}
      </div>
      <Footer settings={settings} />
    </>
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
            <Avatar name={author.name} picture={author.picture} />
          )}
        </div>
      </div>
    </article>
  )
}
