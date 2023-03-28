import { configure, extract, renderFile, renderMarkdown } from "./deps.ts";

const postsDir = "./posts";
const templatesDir = "./templates";
const outputDir = "./dist";

configure({ views: templatesDir });

// read all files on postsDir
for await (const file of Deno.readDir(postsDir)) {
  const decoder = new TextDecoder("utf-8");

  const doc = file.name;
  const content = decoder.decode(await Deno.readFile(`./posts/${doc}`));

  // read metadata and content on each file
  const { body, attrs } = extract(content);

  const markup = renderMarkdown(body);

  const outputFilename = `${doc}.html`;

  // put that inside a layout
  const html = await renderFile(`/base.eta`, {
    title: attrs.title,
    content: markup,
    links: { postLink: outputFilename },
  });

  const outputPath = `${outputDir}/posts/${outputFilename}`;

  await Deno.mkdir(`${outputDir}/posts`, { recursive: true });
  await Deno.writeTextFile(outputPath, html);
}

// generate posts list to be used inside index
// generate other pages (about, blog, etc)
