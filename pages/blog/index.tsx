import { Blog, getAllPosts } from "@utils/extract_meta";
import Image from "next/image";
import Link from "next/link";
import React from "react";

export const getStaticProps = async () => {
  const posts = getAllPosts(false);
  const tags = posts.reduce((tags, p) => {
    p.meta.tags.forEach((t) => tags.add(t.trim()));
    return tags;
  }, new Set<string>());
  return {
    props: {
      posts,
      tags: Array.from(tags),
    },
  };
};

function Home(props: { posts: Blog[]; tags: string[] }) {
  const [selectedTags, setSelectedTags] = React.useState<string[]>([]);

  const [posts, setPosts] = React.useState(props.posts);
  React.useEffect(() => {
    if (selectedTags && selectedTags.length > 0) {
      setPosts(
        props.posts.filter((p) =>
          selectedTags.some((t) => p.meta.tags.includes(t))
        )
      );
    } else {
      setPosts(props.posts);
    }
  }, [selectedTags]);

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };
  return (
    <>
      <div className="relative h-screen w-screen antialiased ">
        <div className="grid m-2 max-w-screen-md mx-auto">
          {posts.map((post, i) => {
            return (
              <Link href={"/blog/" + post.meta.slug} passHref key={i}>
                <div
                  key={post.meta.slug}
                  className="p-6 cursor-pointer rounded-md grid my-4 md:grid-cols-[8rem_1fr] sm:grid-cols-1  group  transform transition duration-500"
                >
                  <Image
                    height={300}
                    width={700}
                    className="transform hover:drop-shadow transition duration-500 group-hover:scale-105 h-full max-h-[30vw] w-full object-cover rounded-md"
                    src={
                      post.meta?.image?.href ??
                      "/images/home-imgs/home-img2.webp"
                    }
                    alt={post.meta?.image?.alt}
                  />

                  <div className="flex flex-col ml-5 ">
                    <h1 className="text-2xl font-bold my-2">
                      {post.meta.title}
                    </h1>
                    <span>
                      <strong>{post.meta.authors.join(", ")}</strong> -{" "}
                      {new Date(post.meta.date).toLocaleDateString()}
                    </span>
                    <p className="text-lg">{post.meta.summary}</p>
                    <div className="mt-5">
                      {post.meta.tags.map((tag, i) => {
                        return (
                          <a
                            key={i}
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleTag(tag);
                            }}
                            className={`inline-block  ${
                              selectedTags.includes(tag)
                                ? "text-green-400"
                                : "text-gray-400"
                            } rounded-full px-2 py-0 mr-2`}
                          >
                            #{tag}
                          </a>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}
export default Home;
