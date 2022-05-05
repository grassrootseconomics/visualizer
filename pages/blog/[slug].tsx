import { getAllPosts, getPost } from "@utils/extract_meta";
import { GetStaticPaths, GetStaticProps } from "next";
import { MDXRemote } from "next-mdx-remote";
import { serialize } from "next-mdx-remote/serialize";
// import Image from "next/image";
export const getStaticPaths: GetStaticPaths = async () => {
  const posts = getAllPosts();
  const paths = posts.map((post) => ({
    params: {
      slug: post.meta.slug,
    },
  }));
  return {
    paths,
    fallback: false,
  };
};
const ResponsiveImage = (props) => (
  <img
    alt={props.alt}
    className="max-h-96 rounded-md m-auto"
    layout="fill"
    {...props}
  />
);
const components = {
  img: ResponsiveImage,
  h1: (props) => <h1 className="text-2xl font-bold my-2">{props.children}</h1>,
  h2: (props) => <h2 className="text-xl font-bold my-2">{props.children}</h2>,
  p: (props) => <p className="text-lg my-4">{props.children}</p>,
};

export const getStaticProps: GetStaticProps = async ({ params: { slug } }) => {
  const markdownWithMeta = getPost(slug + ".md", true);
  const mdxSource = await serialize(markdownWithMeta.content);

  return {
    props: {
      meta: markdownWithMeta.meta,
      slug,
      mdxSource,
    },
  };
};
// TODO Remove all references to this
const SITEURL = "http://localhost:3000/";
const PostPage = ({ meta, mdxSource }) => {
  return (
    <>
      {/* <!-- Social Meta Tags --> */}
      <meta name="description" content={meta.summary} />

      {/* <!-- Facebook Meta Tags --> */}
      <meta property="og:url" content={`${SITEURL}/category/${meta.slug}`} />
      <meta property="og:type" content="website" />
      <meta property="og:title" content={`{ SITENAME }} - {{article.title}`} />
      <meta property="og:description" content={`{article.summary|striptags}`} />
      <meta
        property="og:image"
        content="https://grassrootseconomics.org/images/blog/${article.slug}}1.webp"
      />

      {/* <!-- Twitter Meta Tags --> */}
      <meta name="twitter:card" content={`/images/blog/${meta.slug}}1.webp`} />
      <meta property="twitter:domain" content="grassrootseconomics.org" />
      <meta
        property="twitter:url"
        content={`${SITEURL}/category/${meta.slug}`}
      />
      <meta name="twitter:title" content={`${meta.title}`} />
      <meta name="twitter:description" content={meta.summary} />
      <meta
        name="twitter:image"
        content={`https://grassrootseconomics.org/images/blog/${meta.slug}}1.webp`}
      />
      {/* <!-- End Social Meta Tags --> */}

      <div className="px-2 mt-4 max-w-3xl m-auto">
        <h1 className="text-center text-2xl p-2 mb-3 font-bold">
          {meta.title}
        </h1>

        <MDXRemote {...mdxSource} components={components} />
      </div>
    </>
  );
};
export default PostPage;
