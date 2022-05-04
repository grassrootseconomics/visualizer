import fs from "fs";
import path from "path";
type Image = {
  href: string;
  alt: string;
};
type Meta = {
  title: string;
  authors: string[];
  date: number | null;
  slug: string;
  summary: string;
  modified: string;
  tags: string[];
  image: Image | null;
};
export type Blog = {
  meta: Meta;
  content: string;
};
export function getAllPosts(withContent: boolean = false): Blog[] {
  const files = fs.readdirSync(path.join("blog"));
  const data: Blog[] = [];
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const post = getPost(file, withContent);
    data.push(post);
  }
  return data.sort((a, b) => {
    const d1 = a.meta.date ?? 0;
    const d2 = b.meta.date ?? 0;
    return d2 - d1;
  });
}

export function getPost(filename: string, withContent: boolean = false): Blog {
  const markdownWithMeta = fs.readFileSync(
    path.join("blog", filename),
    "utf-8"
  );
  const meta_array = markdownWithMeta.match(
    /(Title|Author|Authors|Date|Slug|Summary|Modified|Tags):(.+)/g
  );
  const image = markdownWithMeta.match(/!\[(.+)\]\((.+)\)/);
  const meta: Meta = {
    title: "",
    authors: [],
    date: null,
    slug: "",
    summary: "",
    modified: "",
    image: image
      ? {
          alt: image[1],
          href: image[2],
        }
      : null,
    tags: [],
  };
  meta_array.forEach((m) => {
    const [key, value] = m.split(":");
    if (key.trim() === "Tags") {
      meta.tags = value
        .trim()
        .toLowerCase()
        .split(",")
        .map((t) => t.trim());
    } else if (key.trim() === "Authors") {
      meta.authors = value
        .trim()
        .split(",")
        .map((t) => t.trim());
    } else if (key.trim() === "Date") {
      meta.date = Date.parse(value.trim());
    } else if (key.trim() === "Author") {
      meta.authors = [value.trim()];
    } else {
      meta[key.trim().toLowerCase()] = value.trim();
    }
  });
  const content = withContent
    ? markdownWithMeta.replace(
        /(Title|Authors|Author|Date|Slug|Summary|Modified|Tags):(.+)\n/g,
        ""
      )
    : "";
  return { meta, content };
}
