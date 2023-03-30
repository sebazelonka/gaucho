import { etaConfig, extract, renderFile, renderMarkdown } from "./deps.ts";
import { folders } from "./config/index.ts";

const { postsDir, templatesDir, outputDir } = folders;

etaConfig({ views: templatesDir });

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
      Deno.readFileSync(`${postsDir}/${post.file}`)
    );

    // read metadata and content on each file
    const { body, attrs } = extract(content);
    const markup = renderMarkdown(body);

    // put that inside a template
    const html = await renderFile(`/base.eta`, {
      title: attrs.title,
      content: markup,
      links: { postLink: post.link },
    });

    const outputPath = `${outputDir}/posts/${post.link}`;

    await Deno.mkdir(`${outputDir}/posts`, { recursive: true });
    await Deno.writeTextFile(outputPath, html);
  });
};

posts();

// generate posts list to be used inside index
// generate other pages (about, blog, etc)
