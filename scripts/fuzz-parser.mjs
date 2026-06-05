import {
  formatOntosDocument,
  OntosParseError,
  parseOntosDocument,
  validateOntosDocument
} from "@ontos-protocol/parser";

const iterations = 300;
let state = 0x5eed_1a0;

for (let index = 0; index < iterations; index += 1) {
  const input = createDocument(index);
  try {
    const ast = parseOntosDocument(input, { preserveComments: true });
    const diagnostics = validateOntosDocument(input);
    if ((ast.diagnostics !== undefined && !Array.isArray(ast.diagnostics)) || !Array.isArray(diagnostics)) {
      throw new Error("Parser did not return diagnostic arrays.");
    }
    if (diagnostics.some((diagnostic) => diagnostic.severity === "error")) {
      let rejected = false;
      try {
        formatOntosDocument(input);
      } catch (error) {
        if (!(error instanceof OntosParseError)) {
          throw error;
        }
        rejected = true;
      }
      if (!rejected) {
        throw new Error("Formatter accepted invalid input.");
      }
      continue;
    }
    const formatted = formatOntosDocument(input);
    if (typeof formatted !== "string" || !formatted.endsWith("\n")) {
      throw new Error("Formatter did not return a final-newline string.");
    }
  } catch (error) {
    throw new Error(`Parser fuzz failed at iteration ${index}: ${error.message}\n${input}`);
  }
}

console.log(`parser fuzz ok (${iterations} deterministic inputs)`);

function createDocument(index) {
  const lines = [];
  if (pick(5) !== 0) {
    lines.push("@ontos 1.0");
  }
  if (pick(6) !== 0) {
    lines.push(`@title Fuzz ${index}`);
  }
  if (pick(3) === 0) {
    lines.push("@type fuzz");
  }
  lines.push("");

  const nodes = 1 + pick(12);
  for (let node = 0; node < nodes; node += 1) {
    const indent = " ".repeat(pick(4) * 2);
    const title = token("Node", index, node);
    const id = pick(8) === 0 ? "duplicate" : slug(`node-${index}-${node}`);
    const tags = pick(3) === 0 ? " #alpha #beta" : "";
    lines.push(`${indent}- ${title} @id(${id})${tags}`);

    const fieldCount = pick(4);
    for (let field = 0; field < fieldCount; field += 1) {
      const fieldIndent = `${indent}  `;
      switch (pick(5)) {
        case 0:
          lines.push(`${fieldIndent}purpose: ${token("Purpose", index, field)}`);
          break;
        case 1:
          lines.push(`${fieldIndent}items:`);
          lines.push(`${fieldIndent}  - ${token("Item", node, field)}`);
          lines.push(`${fieldIndent}  - Reference [[${id}]]`);
          break;
        case 2:
          lines.push(`${fieldIndent}verify: [[${id}.purpose]]`);
          break;
        case 3:
          lines.push(`${fieldIndent}// comment ${field}`);
          break;
        default:
          lines.push(`${fieldIndent}${pick(2) === 0 ? "bad-key!" : "notes"}: ${token("Note", field, index)}`);
          break;
      }
    }

    if (pick(7) === 0) {
      lines.push(`${indent} odd indentation`);
    }
    if (pick(6) === 0) {
      lines.push("");
    }
  }

  return `${lines.join("\n")}\n`;
}

function pick(max) {
  state ^= state << 13;
  state ^= state >>> 17;
  state ^= state << 5;
  return Math.abs(state) % max;
}

function token(prefix, a, b) {
  return `${prefix} ${a}-${b}`;
}

function slug(value) {
  return value.replace(/[^a-z0-9-]+/g, "-");
}
