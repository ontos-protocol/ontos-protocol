import { build } from "esbuild";
import { cpSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const sourceDir = "website/src";
const outDir = "website/dist";

rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });
mkdirSync(join(outDir, "examples"), { recursive: true });
mkdirSync(join(outDir, "assets"), { recursive: true });

cpSync(join(sourceDir, "index.html"), join(outDir, "index.html"));
cpSync(join(sourceDir, "styles.css"), join(outDir, "styles.css"));
cpSync(join(sourceDir, "robots.txt"), join(outDir, "robots.txt"));
cpSync(join(sourceDir, "sitemap.xml"), join(outDir, "sitemap.xml"));
cpSync(join(sourceDir, "assets"), join(outDir, "assets"), { recursive: true });
cpSync("examples", join(outDir, "examples"), {
  recursive: true,
  filter: (path) => path.endsWith(".ontos") || !path.includes(".")
});

await build({
  entryPoints: [join(sourceDir, "app.js")],
  bundle: true,
  format: "esm",
  outfile: join(outDir, "app.js"),
  sourcemap: false,
  platform: "browser",
  target: ["es2020"]
});

const index = readFileSync(join(outDir, "index.html"), "utf8");
const app = readFileSync(join(outDir, "app.js"), "utf8");
for (const required of [
  ".ontos Protocol",
  "Viewer Demo",
  "Examples Gallery",
  "AI Context Pack",
  "viewer-screenshot.svg",
  "Docs",
  "./app.js"
]) {
  if (!index.includes(required)) {
    throw new Error(`website index is missing ${required}`);
  }
}
if (!app.includes("createOntosViewerApp") && !app.includes("ontos-viewer")) {
  throw new Error("website app bundle does not include viewer code.");
}

writeFileSync(join(outDir, ".nojekyll"), "", "utf8");
console.log("website build ok");
