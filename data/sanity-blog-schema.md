# Sanity Blog Schema (Copy to your Studio)

Use this schema in your Sanity Studio project for campaign blogs.

```javascript
// schemaTypes/post.js
export default {
  name: "post",
  title: "Post",
  type: "document",
  fields: [
    { name: "title", title: "Title", type: "string", validation: (Rule) => Rule.required() },
    { name: "slug", title: "Slug", type: "slug", options: { source: "title", maxLength: 96 }, validation: (Rule) => Rule.required() },
    { name: "excerpt", title: "Excerpt", type: "text", rows: 4 },
    { name: "publishedAt", title: "Published At", type: "datetime" },
    { name: "author", title: "Author", type: "reference", to: [{ type: "author" }] },
    { name: "category", title: "Category", type: "reference", to: [{ type: "category" }] },
    { name: "featured", title: "Featured", type: "boolean", initialValue: false },
    { name: "mainImage", title: "Main Image", type: "image", options: { hotspot: true } },
    {
      name: "body",
      title: "Body",
      type: "array",
      of: [
        { type: "block" },
        { type: "image", options: { hotspot: true } }
      ]
    }
  ]
};
```

```javascript
// schemaTypes/category.js
export default {
  name: "category",
  title: "Category",
  type: "document",
  fields: [
    { name: "title", title: "Title", type: "string", validation: (Rule) => Rule.required() },
    { name: "slug", title: "Slug", type: "slug", options: { source: "title" }, validation: (Rule) => Rule.required() }
  ]
};
```

```javascript
// schemaTypes/author.js
export default {
  name: "author",
  title: "Author",
  type: "document",
  fields: [
    { name: "name", title: "Name", type: "string", validation: (Rule) => Rule.required() },
    { name: "bio", title: "Bio", type: "text" },
    { name: "image", title: "Image", type: "image", options: { hotspot: true } }
  ]
};
```

```javascript
// schemaTypes/index.js
import post from "./post";
import category from "./category";
import author from "./author";

export const schemaTypes = [post, category, author];
```
