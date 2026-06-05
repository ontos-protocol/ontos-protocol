import { build } from "esbuild";
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";

const temp = mkdtempSync(join(tmpdir(), "ontos-runtime-"));

try {
  await validateBrowserBundle("parser", `
    import { createStableNodeId, parseOntosDocument } from ${JSON.stringify(resolve("packages/parser/src/index.js"))};
    const ast = parseOntosDocument("@ontos 1.0\\n@title Browser\\n\\n- Root @id(root)\\n");
    if (ast.metadata.title !== "Browser") throw new Error("parser browser bundle failed");
    if (createStableNodeId("Browser Bundle") !== "browser-bundle") throw new Error("stable ID failed");
  `);

  await validateBrowserBundle("viewer", `
    import { createViewerModel, exportViewerDocument } from ${JSON.stringify(resolve("packages/viewer/src/index.js"))};
    const model = createViewerModel("@ontos 1.0\\n@title Browser Viewer\\n\\n- Root @id(root)\\n  purpose: Render locally.\\n");
    if (model.stats.nodes !== 1) throw new Error("viewer model failed");
    if (!exportViewerDocument(model, "html").includes("<details")) throw new Error("viewer export failed");
  `);

  const treeEntry = join(temp, "tree-entry.js");
  const treeBundle = join(temp, "tree-bundle.js");
  writeFileSync(
    treeEntry,
    `import { createStableNodeId } from ${JSON.stringify(resolve("packages/parser/src/index.js"))};
console.log(createStableNodeId("Tree Shake"));`,
    "utf8"
  );
  await build({
    entryPoints: [treeEntry],
    bundle: true,
    format: "esm",
    outfile: treeBundle,
    platform: "browser",
    target: ["es2020"],
    treeShaking: true,
    minify: true,
    sourcemap: true
  });
  const treeOutput = readFileSync(treeBundle, "utf8");
  if (treeOutput.includes("parseOntosDocument")) {
    throw new Error("stable ID helper bundle retained parser export name.");
  }
  if (treeOutput.length > 2500) {
    throw new Error(`stable ID helper bundle is unexpectedly large: ${treeOutput.length} bytes.`);
  }

  for (const file of [
    "package.json",
    "packages/parser/package.json",
    "packages/schema/package.json",
    "packages/cli/package.json",
    "packages/viewer/package.json",
    "extensions/obsidian/package.json"
  ]) {
    const manifest = JSON.parse(readFileSync(file, "utf8"));
    if (manifest.engines?.node !== ">=20.19") {
      throw new Error(`${file} must declare engines.node >=20.19.`);
    }
  }

  const runtimeTargets = readFileSync("docs/RUNTIME_TARGETS.md", "utf8");
  for (const required of [
    "native ESM",
    "Node.js 20.19",
    "CommonJS builds are not distributed in 1.0",
    "source maps"
  ]) {
    if (!runtimeTargets.includes(required)) {
      throw new Error(`runtime target documentation is missing ${required}.`);
    }
  }

  for (const sourcePath of [
    "scripts/build-viewer-app.mjs",
    "scripts/build-vscode-extension.mjs",
    "scripts/build-obsidian-plugin.mjs"
  ]) {
    if (!readFileSync(sourcePath, "utf8").includes("sourcemap: true")) {
      throw new Error(`${sourcePath} must generate source maps.`);
    }
  }

  if (!existsSync("extensions/vscode/src/extension.js")) {
    throw new Error("VS Code extension source must remain in the source archive.");
  }

  console.log("runtime compatibility ok");
} finally {
  rmSync(temp, { recursive: true, force: true });
}

async function validateBrowserBundle(name, source) {
  const entry = join(temp, `${name}-entry.js`);
  const bundle = join(temp, `${name}-bundle.js`);
  writeFileSync(entry, source, "utf8");
  await build({
    entryPoints: [entry],
    bundle: true,
    format: "esm",
    outfile: bundle,
    platform: "browser",
    target: ["es2020"],
    sourcemap: true
  });
  await import(pathToFileURL(bundle));
}
