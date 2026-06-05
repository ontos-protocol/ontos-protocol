import { performance } from "node:perf_hooks";
import {
  formatOntosDocument,
  parseOntosDocument,
  validateOntosDocument
} from "@ontos-protocol/parser";

const document = createLargeDocument(1500);

const parseResult = timed("parse", () => parseOntosDocument(document));
const validateResult = timed("validate", () => validateOntosDocument(document));
const formatResult = timed("format", () => formatOntosDocument(document));
const reparseResult = timed("reparse formatted", () => parseOntosDocument(formatResult.value));
const tenThousandResult = timed("parse 10000 nodes", () => parseOntosDocument(createLargeDocument(10000)));
const deepResult = timed("parse deeply nested", () => parseOntosDocument(createDeepDocument(90)));
const richResult = timed("parse rich fields", () => parseOntosDocument(createRichFieldDocument(250)));
const duplicateResult = timed("many duplicate diagnostics", () => validateOntosDocument(createDuplicateDocument(500)));

if (parseResult.value.nodes.length !== 1500) {
  throw new Error(`Expected 1500 nodes, found ${parseResult.value.nodes.length}.`);
}
if (validateResult.value.length !== 0) {
  throw new Error(`Expected zero diagnostics, found ${validateResult.value.length}.`);
}
if (reparseResult.value.nodes.length !== 1500) {
  throw new Error("Formatted large document did not round-trip node count.");
}
if (formatOntosDocument(formatResult.value) !== formatResult.value) {
  throw new Error("Large document formatting is not idempotent.");
}
if (tenThousandResult.value.nodes.length !== 10000) {
  throw new Error(`Expected 10000 nodes, found ${tenThousandResult.value.nodes.length}.`);
}
if (deepResult.value.diagnostics?.length) {
  throw new Error("Deep valid document produced diagnostics.");
}
if (richResult.value.nodes.length !== 250) {
  throw new Error("Rich field benchmark did not parse expected nodes.");
}
if (duplicateResult.value.filter((diagnostic) => diagnostic.code === "ONTOS1203").length < 499) {
  throw new Error("Duplicate diagnostic benchmark did not report expected duplicates.");
}

assertBudget(parseResult, 5000);
assertBudget(validateResult, 5000);
assertBudget(formatResult, 7000);
assertBudget(reparseResult, 5000);
assertBudget(tenThousandResult, 15000);
assertBudget(deepResult, 5000);
assertBudget(richResult, 5000);
assertBudget(duplicateResult, 5000);

console.log(
  [
    "performance smoke ok",
    `parse=${parseResult.ms.toFixed(1)}ms`,
    `validate=${validateResult.ms.toFixed(1)}ms`,
    `format=${formatResult.ms.toFixed(1)}ms`,
    `parse10000=${tenThousandResult.ms.toFixed(1)}ms`
  ].join(" ")
);

function createLargeDocument(nodes) {
  const lines = ["@ontos 1.0", "@title Performance smoke", "@type benchmark", ""];
  for (let index = 1; index <= nodes; index += 1) {
    const id = `node-${String(index).padStart(4, "0")}`;
    lines.push(`- Node ${index} @id(${id}) #performance`);
    lines.push(`  purpose: Exercise parser and formatter throughput for ${id}.`);
    lines.push("  status: ready");
    lines.push("  items:");
    lines.push(`    - Validate ${id}`);
    lines.push(`    - Export ${id}`);
    lines.push(`  verify: [[${id}.purpose]]`);
    lines.push("");
  }
  return `${lines.join("\n")}\n`;
}

function createDeepDocument(depth) {
  const lines = ["@ontos 1.0", "@title Deep smoke", "@type benchmark", ""];
  for (let index = 0; index < depth; index += 1) {
    const indent = " ".repeat(index * 2);
    lines.push(`${indent}- Depth ${index + 1} @id(depth-${String(index + 1).padStart(2, "0")})`);
    lines.push(`${indent}  purpose: Exercise nesting depth ${index + 1}.`);
    lines.push("");
  }
  return `${lines.join("\n")}\n`;
}

function createRichFieldDocument(nodes) {
  const lines = ["@ontos 1.0", "@title Rich field smoke", "@type benchmark", ""];
  for (let index = 1; index <= nodes; index += 1) {
    const id = `rich-${String(index).padStart(4, "0")}`;
    lines.push(`- Rich node ${index} @id(${id}) #performance`);
    lines.push("  body: |");
    for (let line = 1; line <= 8; line += 1) {
      lines.push(`    Body line ${line} for ${id}.`);
    }
    lines.push("  snippet: ```js");
    lines.push(`    const id = "${id}";`);
    lines.push("    console.log(id);");
    lines.push("    ```");
    lines.push("");
  }
  return `${lines.join("\n")}\n`;
}

function createDuplicateDocument(nodes) {
  const lines = ["@ontos 1.0", "@title Duplicate smoke", "@type benchmark", ""];
  for (let index = 1; index <= nodes; index += 1) {
    lines.push(`- Duplicate ${index} @id(duplicate-node)`);
    lines.push(`  purpose: Exercise duplicate diagnostic ${index}.`);
    lines.push("");
  }
  return `${lines.join("\n")}\n`;
}

function timed(label, fn) {
  const start = performance.now();
  const value = fn();
  return { label, value, ms: performance.now() - start };
}

function assertBudget(result, budgetMs) {
  if (result.ms > budgetMs) {
    throw new Error(`${result.label} exceeded ${budgetMs}ms: ${result.ms.toFixed(1)}ms.`);
  }
}
