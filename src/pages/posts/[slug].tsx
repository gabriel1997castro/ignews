import { asHTML, asText } from "@prismicio/helpers"
import { GetServerSideProps } from "next"
import { getSession } from "next-auth/react"
import Head from "next/head"
import { createClient } from "../../services/prismicio"
import styles from './post.module.scss';

interface PostsProps {
  post: {
    slug: string;
    title: string;
    content: string;
    updatedAt: string;

  }
}

export default function Post({ post }: PostsProps) {
  return (
    <>
      <Head>
        <title>{post.title}</title>
      </Head>
      <main className={styles.container}>
        <article className={styles.post}>
          <h1>{post.title}</h1>
          <time>{post.updatedAt}</time>
          <div className={styles.postContent} dangerouslySetInnerHTML={{ __html: post.content }} />
        </article>
      </main>
    </>
  )
}
export const getServerSideProps: GetServerSideProps = async ({ req, params, previewData }) => {
  const session = await getSession({ req })
  const client = createClient({ previewData });
  const { slug } = params

  if (!session?.activeSubscription) {
    return {
      redirect: {
        destination: `/posts/preview/${slug}`,
        permanent: false,
      }
    }
  }

  const response = await client.getByUID('post', String(slug))

  const post = {
    slug,
    title: asText(response.data.title),
    content: asHTML(response.data.content),
    updatedAt: new Date(response.last_publication_date).toLocaleDateString('pt-BR', {
      day: '2-digit', month: 'long', year: 'numeric'
    })
  }
  return {
    props: {
      post
    }
  }
}