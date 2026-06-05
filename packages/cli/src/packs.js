import {
  collectReferences,
  findNodeById,
  getNodePath,
  getNodeText
} from "@ontos-protocol/parser";

const PACK_KINDS = new Set([
  "context",
  "review",
  "handoff",
  "modify-boundary",
  "verification"
]);

const DEFAULT_EXCLUDED_FIELDS = new Set([
  "secret",
  "secrets",
  "password",
  "token",
  "api_key",
  "credential",
  "credentials",
  "private"
]);

export function createNodePack(ast, nodeId, kind = "context", options = {}) {
  if (!PACK_KINDS.has(kind)) {
    throw new Error(`Unsupported pack kind: ${kind}`);
  }
  const node = findNodeById(ast, nodeId);
  if (!node) {
    throw new Error(`Node not found: ${nodeId}`);
  }
  const text = limitText(getNodeText(ast, nodeId), options.tokenBudget);
  return {
    kind,
    document: ast.metadata.title,
    nodeId,
    path: getNodePath(ast, nodeId),
    ...(options.tokenBudget
      ? {
          tokenBudget: {
            requested: options.tokenBudget,
            approximateCharacters: options.tokenBudget * 4,
            truncated: text.truncated
          }
        }
      : {}),
    fields: filterFields(node.fields, options.excludeFields),
    linkedReferences: linkedReferences(ast, node),
    sourceReferences: sourceReferences(node),
    text: text.value
  };
}

export function exportPackMarkdown(pack) {
  const sections = [`# .ontos ${pack.kind} pack

document: ${pack.document}
node: ${pack.nodeId}
path: ${pack.path.join(" > ")}`];

  if (pack.tokenBudget) {
    sections.push(`## Token Budget

requested: ${pack.tokenBudget.requested}
approximate characters: ${pack.tokenBudget.approximateCharacters}
truncated: ${pack.tokenBudget.truncated ? "yes" : "no"}`);
  }

  sections.push(`## Fields

${Object.entries(pack.fields)
  .map(([key, value]) => `### ${key}\n\n${valueToText(value)}`)
  .join("\n\n")}`);

  if (pack.linkedReferences?.length) {
    sections.push(`## Linked References

${pack.linkedReferences
  .map((reference) => `- ${reference.kind}: ${reference.target}${reference.path?.length ? ` (${reference.path.join(" > ")})` : ""}`)
  .join("\n")}`);
  }

  if (pack.sourceReferences?.length) {
    sections.push(`## Source References

${pack.sourceReferences.map((reference) => `- ${reference.field}: ${reference.target}`).join("\n")}`);
  }

  sections.push(`## Node Text

\`\`\`text
${pack.text.trimEnd()}
\`\`\``);

  return `${sections.join("\n\n")}\n`;
}

function valueToText(value) {
  if (value && typeof value === "object" && "value" in value) {
    return valueToText(value.value);
  }
  return Array.isArray(value) ? value.join("\n") : String(value ?? "");
}

function filterFields(fields, excludeFields) {
  const excluded = new Set([...(excludeFields ?? DEFAULT_EXCLUDED_FIELDS)]);
  return Object.fromEntries(
    Object.entries(fields ?? {}).filter(([key]) => !excluded.has(key))
  );
}

function linkedReferences(ast, node) {
  return collectReferences({ nodes: [node] }).map((reference) => {
    const targetNodeId = reference.kind === "field" ? reference.target.split(".")[0] : reference.target;
    return {
      kind: reference.kind,
      target: reference.target,
      nodeId: reference.nodeId,
      field: reference.field,
      path: getNodePath(ast, targetNodeId)
    };
  });
}

function sourceReferences(node) {
  const references = [];
  walkNode(node, (current) => {
    for (const [field, value] of Object.entries(current.fields ?? {})) {
      for (const target of flattenValues(value)) {
        if (isExternalReference(target)) {
          references.push({
            nodeId: current.id,
            field,
            target
          });
        }
      }
    }
  });
  return references;
}

function flattenValues(value) {
  if (value && typeof value === "object" && "value" in value) {
    return flattenValues(value.value);
  }
  if (Array.isArray(value)) {
    return value.flatMap(flattenValues);
  }
  return typeof value === "string" ? [value] : [];
}

function isExternalReference(value) {
  return /^(https?:\/\/.+|\.{1,2}\/.+|\/.+|[a-z0-9_.-]+\/.+|[a-z0-9_.-]+\.[a-z0-9]+)$/iu.test(value);
}

function walkNode(node, visitor) {
  visitor(node);
  for (const child of node.children ?? []) {
    walkNode(child, visitor);
  }
}

function limitText(value, tokenBudget) {
  if (!tokenBudget) {
    return { value, truncated: false };
  }
  const approximateCharacters = tokenBudget * 4;
  if (value.length <= approximateCharacters) {
    return { value, truncated: false };
  }
  return {
    value: `${value.slice(0, Math.max(0, approximateCharacters - 4)).trimEnd()}\n...`,
    truncated: true
  };
}
