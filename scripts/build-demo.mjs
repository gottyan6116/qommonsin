import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { build } from "esbuild";
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const result = await build({
  entryPoints: [path.join(root, "scripts/demo-entry.tsx")],
  bundle: true,
  write: false,
  minify: true,
  platform: "browser",
  format: "iife",
  jsx: "automatic",
  define: { "process.env.NODE_ENV": '"production"' },
  tsconfig: path.join(root, "tsconfig.json"),
});
let js = result.outputFiles[0].text;
for (const file of [
  "polimill-logo.png",
  "workshop.jpg",
  ...fs
    .readdirSync(path.join(root, "public/avatars"))
    .map((f) => "avatars/" + f),
]) {
  const mime = file.endsWith(".png") ? "image/png" : "image/jpeg";
  const uri =
    "data:" +
    mime +
    ";base64," +
    fs.readFileSync(path.join(root, "public", file)).toString("base64");
  js = js.replaceAll(JSON.stringify("/" + file), JSON.stringify(uri));
}
let css = fs
  .readFileSync(path.join(root, "app/globals.css"), "utf8")
  .replace(/@import[^;]+;/g, "");
const html =
  '<!doctype html><html lang="ja"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Qommons IN | 行政の知恵を、つなぐ。</title><style>' +
  css +
  '</style></head><body><div id="root"></div><script>' +
  js.replaceAll("</script", "<\\/script") +
  "</script></body></html>";
fs.writeFileSync(path.join(root, "../Qommons-IN-demo.html"), html);
fs.writeFileSync(path.join(root,"index.html"), html);
fs.writeFileSync(path.join(root,".nojekyll"), "");
console.log("Standalone demo generated: " + Buffer.byteLength(html) + " bytes");
