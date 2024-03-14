import { gql } from '@urql/core'
import { groq, type PortableTextBlock } from 'next-sanity'
import type { Image, ImageCrop, ImageHotspot } from 'sanity'

const ImageFragment = gql`
  fragment ImageFragment on Image {
    # not possible to query alt fields on images yet
    # alt
    asset {
      _id
    }
    hotspot {
      _type
      x
      y
      height
      width
    }
    crop {
      _type
      top
      bottom
      left
      right
    }
  }
`
type ImageFragmentType = {
  asset?: { _id: string | null }
  hotspot?: ImageHotspot | null
  crop: ImageCrop | null
  // @TODO add support for custom image fields in GQL
  // alt?: string | null
}

const SettingsFragment = gql`
  fragment SettingsFragment on Settings {
    title
    descriptionRaw
    footerRaw
    ogImage {
      ...ImageFragment
      # @TODO add support for image fields in GQL
      # metadataBase
    }
  }
  ${ImageFragment}
`
type SettingsFragmentType = {
  title?: string
  descriptionRaw?: PortableTextBlock[]
  footerRaw?: PortableTextBlock[]
  ogImage?:
    | (ImageFragmentType & {
        // @TODO add support for image fields in GQL
        // metadataBase?: string | null
      })
    | null
}

export const SettingsQuery = gql`
  query {
    Settings(id: "settings") {
      ...SettingsFragment
    }
  }
  ${SettingsFragment}
`
export interface SettingsQueryData {
  Settings?: SettingsFragmentType | null
}

const AuthorFragment = gql`
  fragment AuthorFragment on Author {
    name
    picture {
      ...ImageFragment
    }
  }
  ${ImageFragment}
`
type AuthorFragmentType = {
  name?: string | null
  picture?: ImageFragmentType | null
}

const PostFragment = gql`
  fragment PostFragment on Post {
    _id
    _updatedAt
    title
    slug {
      current
    }
    excerpt
    coverImage {
      ...ImageFragment
    }
    date
    author {
      ...AuthorFragment
    }
  }
  ${AuthorFragment}
  ${ImageFragment}
`
export type PostFragmentType = {
  _id: string
  _updatedAt: string
  title?: string | null
  slug: { current: string }
  excerpt?: string | null
  coverImage?: ImageFragmentType | null
  date?: string
  author?: AuthorFragmentType | null
}

export const HeroQuery = gql`
  query {
    allPost(
      limit: 1
      where: { slug: { current: { neq: null } } }
      sort: [{ date: DESC }, { _updatedAt: DESC }]
    ) {
      ...PostFragment
    }
  }
  ${PostFragment}
`
export interface HeroQueryData {
  allPost?: [PostFragmentType] | null
}

/** @deprecated */
export interface Author {
  name: string
  picture?: (Image & { alt?: string | null }) | null
}

/** @deprecated */
export interface Post {
  _id: string
  status: 'draft' | 'published'
  title: string
  slug: string
  excerpt?: string | null
  coverImage?: (Image & { alt?: string }) | null
  date: string
  author?: Author | null
}

/** @deprecated */
const postFields = groq`
  _id,
  "status": select(_originalId in path("drafts.**") => "draft", "published"),
  "title": coalesce(title, "Untitled"),
  "slug": slug.current,
  excerpt,
  coverImage,
  "date": coalesce(date, _updatedAt),
  "author": author->{"name": coalesce(name, "Anonymous"), picture},
`

/** @deprecated */
export const moreStoriesQuery = groq`*[_type == "post" && _id != $skip && defined(slug.current)] | order(date desc, _updatedAt desc) [0...$limit] {
  ${postFields}
}`
export type MoreStoriesQueryResponse = Post[] | null

/** @deprecated */
export const postQuery = groq`*[_type == "post" && slug.current == $slug] [0] {
  content,
  ${postFields}
}`
/** @deprecated */
export type PostQueryResponse =
  | (Post & {
      content?: PortableTextBlock[] | null
    })
  | null
