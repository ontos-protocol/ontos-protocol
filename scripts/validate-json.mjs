import { readFileSync } from "node:fs";

const files = [
  ".github/branch-protection-main.json",
  "config/github-project-board.json",
  "config/repository-settings.json",
  "spec/ontos-ast-schema-1.0.json",
  "packages/schema/src/ontos-ast.schema.json",
  "spec/conformance/ast/project-state.ast.json",
  "spec/conformance/invalid/expected-diagnostics.json"
];

for (const file of files) {
  JSON.parse(readFileSync(file, "utf8"));
}

console.log(`validated ${files.length} JSON files`);
