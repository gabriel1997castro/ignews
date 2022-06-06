import styles from './styles.module.scss';
import Head from 'next/head'
import { GetStaticProps } from 'next';
import { createClient } from '../../services/prismicio';
import { asText } from '@prismicio/helpers'
import Link from 'next/link';

type Post = {
  slug: string
  title: string
  exerpt: string
  updatedAt: string
}

interface PostsProps {
  posts: Post[]
}

export default function Posts({ posts }: PostsProps) {
  return (
    <>
      <Head>
        <title>Posts | Ignews</title>
      </Head>
      <main className={styles.container}>
        <div className={styles.posts}>
          {posts.map(post => (
            <Link key={post.slug} href={`/posts/${post.slug}`}>
              <a>
                <time>{post.updatedAt}</time>
                <strong>{post.title}</strong>
                <p>{post.exerpt}</p>
              </a>
            </Link>
          ))}
        </div>
      </main>
    </>
  )
}

export const getStaticProps: GetStaticProps = async ({ previewData }) => {
  const client = createClient({ previewData });

  const response = await client.getAllByType('post', { pageSize: 10 })

  const posts = response.map(post => {
    return {
      slug: post.uid,
      title: asText(post.data.title),
      exerpt: post.data.content.find(content => content.type === 'paragraph' && content.text.length > 0)?.text ?? '',
      updatedAt: new Date(post.last_publication_date).toLocaleDateString('pt-BR', {
        day: '2-digit', month: 'long', year: 'numeric'
      })
    }
  })

  return {
    props: { posts }
  }
}