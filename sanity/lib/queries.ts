import { gql } from '@urql/core'
import { groq, type PortableTextBlock } from 'next-sanity'
import type { Image, ImageCrop, ImageHotspot } from 'sanity'

export const SettingsQuery = gql`
  query {
    Settings(id: "settings") {
      title
      descriptionRaw
      footerRaw
      ogImage {
        # not possible to query fields on images yet
        # alt
        # metadataBase
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
    }
  }
`
export interface SettingsQueryData {
  Settings?: {
    title?: string
    descriptionRaw?: PortableTextBlock[]
    footerRaw?: PortableTextBlock[]
    // @TODO add support for image fields in GQL
    // ogImage?: (Image & { alt?: string; metadataBase?: string }) | null
    ogImage?: {
      asset?: { _id: string | null }
      hotspot?: ImageHotspot | null
      crop: ImageCrop | null
    } | null
  } | null
}

export interface Author {
  name: string
  picture?: (Image & { alt?: string | null }) | null
}
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

export const heroQuery = groq`*[_type == "post" && defined(slug.current)] | order(date desc, _updatedAt desc) [0] {
  content,
  ${postFields}
}`
export type HeroQueryResponse =
  | (Post & {
      content?: PortableTextBlock[] | null
    })
  | null

export const moreStoriesQuery = groq`*[_type == "post" && _id != $skip && defined(slug.current)] | order(date desc, _updatedAt desc) [0...$limit] {
  ${postFields}
}`
export type MoreStoriesQueryResponse = Post[] | null

export const postQuery = groq`*[_type == "post" && slug.current == $slug] [0] {
  content,
  ${postFields}
}`
export type PostQueryResponse =
  | (Post & {
      content?: PortableTextBlock[] | null
    })
  | null
