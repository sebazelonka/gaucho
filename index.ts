import { ensureDir, extract, renderMarkdown } from "./deps.ts";
import { folders, header } from "./config/index.ts";
import { Handlebars } from "https://deno.land/x/handlebars@v0.9.0/mod.ts";

const { postsDir, templatesDir, outputDir } = folders;

const handle = new Handlebars({
  baseDir: templatesDir,
  extname: ".hbs",
  layoutsDir: "/",
  partialsDir: "partials/",
  cachePartials: true,
  defaultLayout: "base",
  helpers: undefined,
  compilerOptions: undefined,
});

const paths: { file: string; link: string }[] = [];

const getPosts = async () => {
  // read all files on postsDir
  for await (const file of Deno.readDir(postsDir)) {
    // generate the html name
    const link = file.name.split(".")[0] + ".html";

    paths.push({ file: file.name, link });
  }
};

const posts = async () => {
  await getPosts();
  paths.map(async (post) => {
    const decoder = new TextDecoder("utf-8");

    const content = decoder.decode(
      await Deno.readFile(`${postsDir}/${post.file}`)
    );

    // read metadata and content on each file
    const { body, attrs } = extract(content);
    const markup = renderMarkdown(body);

    // put that inside a template
    const html = await handle.renderView(`base`, {
      title: attrs.title,
      content: markup,
      header: header,
    });

    const outputPath = `${outputDir}/posts/${post.link}`;

    ensureDir(`${outputDir}/posts`);

    try {
      await Deno.writeTextFile(outputPath, html, { createNew: true });
    } catch (error) {
      if (error instanceof Deno.errors.AlreadyExists) {
        console.log("⚠️", "File already exists:", outputPath);
      } else {
        throw error;
      }
    }
  });
};

posts();

// generate posts list to be used inside index
// generate other pages (about, blog, etc)
