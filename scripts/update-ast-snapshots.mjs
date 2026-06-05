import { readdirSync, writeFileSync } from "node:fs";
import { basename, join } from "node:path";
import { parseOntosDocument } from "@ontos-protocol/parser";
import { readFileSync } from "node:fs";

const examples = readdirSync("examples")
  .filter((file) => file.endsWith(".ontos"))
  .sort();

for (const example of examples) {
  const source = readFileSync(join("examples", example), "utf8");
  const ast = parseOntosDocument(source, { includeDiagnostics: false });
  const name = basename(example, ".ontos");
  writeFileSync(
    join("tests/snapshots/ast", `${name}.ast.json`),
    `${JSON.stringify(ast, null, 2)}\n`,
    "utf8"
  );
}

console.log(`updated ${examples.length} AST snapshots`);
