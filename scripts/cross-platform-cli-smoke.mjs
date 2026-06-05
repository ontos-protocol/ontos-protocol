import { readFileSync } from "node:fs";
import { join } from "node:path";
import { run } from "../packages/cli/src/index.js";

const manifest = JSON.parse(readFileSync("packages/cli/package.json", "utf8"));

if (manifest.bin?.ontosfmt !== "./src/index.js") {
  throw new Error("CLI bin mapping for ontosfmt is incorrect.");
}

const windowsBin = join("node_modules", ".bin", "ontosfmt.cmd");
const posixBin = join("node_modules", ".bin", "ontosfmt");
if (!windowsBin.endsWith("ontosfmt.cmd") || !posixBin.endsWith("ontosfmt")) {
  throw new Error("CLI bin path calculation is not cross-platform.");
}

const samples = [
  ["--version"],
  ["validate", "spec/conformance/valid/project-state.ontos", "--quiet"],
  ["format", "spec/conformance/format/formatted.ontos", "--check"],
  ["export", "spec/conformance/valid/project-state.ontos", "--to", "json"],
  ["pack", "spec/conformance/valid/project-state.ontos", "--node", "current-release", "--for", "context"]
];

for (const argv of samples) {
  let stdout = "";
  let stderr = "";
  const code = run(argv, {
    out: (value) => {
      stdout += value;
    },
    err: (value) => {
      stderr += value;
    }
  });
  if (code !== 0) {
    throw new Error(`CLI command failed without shell: ${argv.join(" ")}\n${stderr}`);
  }
  if (stdout.length === 0 && !argv.includes("--quiet")) {
    throw new Error(`CLI command produced no output: ${argv.join(" ")}`);
  }
}

console.log("cross-platform CLI smoke ok");
