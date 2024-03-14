import type { GetStaticProps, InferGetStaticPropsType } from 'next'

import type { SharedPageProps } from '@/pages/_app'
import { token } from '@/sanity/lib/token'
import { defineGetStaticProps } from '@/components/UrqlProvider'

interface PageProps extends SharedPageProps {
  //
}

export const getStaticProps = defineGetStaticProps(async (client) => {})

export default function Page(
  props: InferGetStaticPropsType<typeof getStaticProps>,
) {
  console.log(props)
  return (
    <>
      <h1>TODO draftMode:{props.draftMode ? 'true' : 'false'}</h1>
    </>
  )
}
