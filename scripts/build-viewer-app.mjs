import { build } from "esbuild";
import { cpSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const sourceDir = "apps/viewer/src";
const outDir = "apps/viewer/dist";

rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });
mkdirSync(join(outDir, "examples"), { recursive: true });

cpSync(join(sourceDir, "index.html"), join(outDir, "index.html"));
cpSync(join(sourceDir, "styles.css"), join(outDir, "styles.css"));
cpSync("examples/project-state.ontos", join(outDir, "examples/project-state.ontos"));

await build({
  entryPoints: [join(sourceDir, "app.js")],
  bundle: true,
  format: "esm",
  outfile: join(outDir, "app.js"),
  platform: "browser",
  target: ["es2020"],
  sourcemap: true
});

const html = readFileSync(join(outDir, "index.html"), "utf8");
const app = readFileSync(join(outDir, "app.js"), "utf8");
for (const required of [".ontos Viewer", "viewer-app", "./app.js"]) {
  if (!html.includes(required)) {
    throw new Error(`viewer app HTML is missing ${required}.`);
  }
}
if (!app.includes("createOntosViewerApp") && !app.includes("ontos-viewer")) {
  throw new Error("viewer app bundle does not include viewer runtime.");
}

writeFileSync(join(outDir, ".nojekyll"), "", "utf8");
console.log("viewer app build ok");
