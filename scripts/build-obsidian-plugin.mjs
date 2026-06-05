import { build } from "esbuild";
import { cpSync, mkdirSync, readFileSync, rmSync } from "node:fs";
import { join } from "node:path";

const root = "extensions/obsidian";
const dist = join(root, "dist");
const vaultPlugin = join(root, "vault/.obsidian/plugins/ontos-protocol");

rmSync(dist, { recursive: true, force: true });
mkdirSync(dist, { recursive: true });

await build({
  entryPoints: [join(root, "src/main.js")],
  bundle: true,
  format: "cjs",
  outfile: join(dist, "main.js"),
  platform: "browser",
  target: ["es2020"],
  external: ["obsidian"],
  sourcemap: true
});

for (const file of ["manifest.json", "styles.css"]) {
  cpSync(join(root, file), join(dist, file));
}

rmSync(vaultPlugin, { recursive: true, force: true });
mkdirSync(vaultPlugin, { recursive: true });
for (const file of ["main.js", "main.js.map", "manifest.json", "styles.css"]) {
  cpSync(join(dist, file), join(vaultPlugin, file));
}

const manifest = JSON.parse(readFileSync(join(dist, "manifest.json"), "utf8"));
const main = readFileSync(join(dist, "main.js"), "utf8");
if (manifest.id !== "ontos-protocol" || !main.includes("Preview current .ontos file")) {
  throw new Error("Obsidian plugin build output is incomplete.");
}

console.log("Obsidian plugin build ok");
