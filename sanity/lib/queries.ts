import { gql } from '@urql/core'
import type { PortableTextBlock } from 'next-sanity'
import type { ImageCrop, ImageHotspot } from 'sanity'

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
export type ImageFragmentType = {
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
export type AuthorFragmentType = {
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
      where: { slug: { current: { neq: null } } }
      limit: 1
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

export const MoreStoriesQuery = gql`
  query ($skip: ID!, $limit: Int!) {
    allPost(
      where: { slug: { current: { neq: null } }, _id: { neq: $skip } }
      limit: $limit
      sort: [{ date: DESC }, { _updatedAt: DESC }]
    ) {
      ...PostFragment
    }
  }
  ${PostFragment}
`
export interface MoreStoriesQueryData {
  allPost?: PostFragmentType[] | null
}

export const PostQuery = gql`
  query ($slug: String!) {
    allPost(where: { slug: { current: { eq: $slug } } }, limit: 1) {
      ...PostFragment
      contentRaw
    }
  }
  ${PostFragment}
`
export interface PostQueryData {
  allPost?:
    | [
        PostFragmentType & {
          contentRaw?: PortableTextBlock[] | null
        },
      ]
    | null
}
