const FORMAT_VERSION = "1.0";

const DIAGNOSTICS = {
  missingRequiredHeader: "ONTOS1001",
  unsupportedFormatVersion: "ONTOS1002",
  duplicateHeader: "ONTOS1003",
  invalidHeaderKey: "ONTOS1004",
  invalidIndentation: "ONTOS1101",
  tabIndentation: "ONTOS1102",
  emptyNodeTitle: "ONTOS1201",
  invalidNodeId: "ONTOS1202",
  duplicateNodeId: "ONTOS1203",
  invalidTag: "ONTOS1204",
  missingRequiredNodeId: "ONTOS1205",
  invalidFieldKey: "ONTOS1301",
  duplicateField: "ONTOS1302",
  reservedFieldMisuse: "ONTOS1303",
  invalidMultilineField: "ONTOS1304",
  invalidCodeField: "ONTOS1305",
  brokenNodeReference: "ONTOS1401",
  brokenFieldReference: "ONTOS1402",
  invalidFileReference: "ONTOS1403",
  nonCanonicalFormatting: "ONTOS1501",
  missingRecommendedField: "ONTOS1601",
  unknownDocumentType: "ONTOS1602",
  deprecatedField: "ONTOS1603",
  unsafeExportContent: "ONTOS1701",
  inputTooLarge: "ONTOS1801",
  maxDepthExceeded: "ONTOS1802"
};

const DEFAULT_MAX_INPUT_BYTES = 5 * 1024 * 1024;
const DEFAULT_MAX_DEPTH = 100;

const ID_RE = /^[a-z][a-z0-9-]*$/;
const TAG_RE = /^[a-z][a-z0-9-]*$/;
const FIELD_RE = /^([a-z][a-z0-9_]*):(?:\s*(.*))?$/;
const HEADER_RE = /^@([a-z][a-z0-9-]*)(?:\s+(.*))?$/;
const NODE_ID_RE = /@id\(([^)]+)\)/g;
const TAG_CANDIDATE_RE = /(^|\s)#(\S+)/gu;
const ISSUE_NUMBER_RE = /^\d+$/u;
const REF_RE = /\[\[([^\]]+)\]\]/g;
const KNOWN_DOCUMENT_TYPES = new Set([
  "ai-handoff",
  "app-design",
  "benchmark",
  "bug-fix",
  "conformance",
  "open-source-roadmap",
  "parser-fixture",
  "product-spec",
  "project-state",
  "release-plan",
  "research-notes",
  "review-pack",
  "team-knowledge"
]);
const RECOMMENDED_FIELDS = {
  "app-design": ["purpose", "user", "current", "frontend", "backend", "risk", "verify", "status"],
  "project-state": ["status", "current", "todo", "risk", "verify", "history", "handoff"],
  "ai-handoff": ["context", "instruction", "boundary", "do_not_touch", "acceptance", "verify", "handoff"],
  "product-spec": ["purpose", "user", "current", "acceptance", "risk", "verify", "status"]
};

export class OntosParseError extends Error {
  constructor(message, diagnostics, ast) {
    super(message);
    this.name = "OntosParseError";
    this.diagnostics = diagnostics;
    this.ast = ast;
  }
}

export function parseOntosDocument(text, options = {}) {
  if (typeof text !== "string") {
    throw new TypeError("parseOntosDocument expects a string.");
  }

  const diagnostics = [];
  const comments = [];
  const metadata = {};
  const seenHeaders = new Set();
  const nodes = [];
  const stack = [];
  const listFields = new Map();
  const maxInputBytes = positiveIntegerOption(options.maxInputBytes, DEFAULT_MAX_INPUT_BYTES);
  const maxDepth = nonNegativeIntegerOption(options.maxDepth, DEFAULT_MAX_DEPTH);
  let formatVersion = FORMAT_VERSION;
  let inHeader = true;

  function addDiagnostic(code, severity, message, line, column = 1, extra = {}) {
    diagnostics.push({
      code,
      severity,
      message,
      source: sourceRange(line, column, line, column),
      ...extra
    });
  }

  if (utf8ByteLength(text) > maxInputBytes) {
    addDiagnostic(
      DIAGNOSTICS.inputTooLarge,
      "error",
      `Input exceeds maximum size of ${maxInputBytes} bytes.`,
      1,
      1,
      { suggestion: "Increase maxInputBytes only for trusted inputs or split the document." }
    );
    return finalizeAst();
  }

  const lines = text.replace(/\r\n?/g, "\n").split("\n");

  let index = 0;
  for (; index < lines.length; index += 1) {
    const lineNumber = index + 1;
    const rawLine = lines[index];

    if (rawLine.trim() === "") {
      continue;
    }

    const leading = rawLine.match(/^[ \t]*/)?.[0] ?? "";
    if (leading.includes("\t")) {
      addDiagnostic(
        DIAGNOSTICS.tabIndentation,
        "error",
        "Tabs are not allowed for indentation.",
        lineNumber,
        leading.indexOf("\t") + 1,
        { suggestion: "Replace tab indentation with spaces." }
      );
    }

    const indent = countLeadingSpaces(rawLine);
    const content = rawLine.slice(indent);

    if (content.startsWith("//")) {
      comments.push({
        text: content.slice(2).trimStart(),
        source: sourceRange(lineNumber, indent + 1, lineNumber, rawLine.length + 1)
      });
      continue;
    }

    if (inHeader && content.startsWith("@")) {
      parseHeader(content, lineNumber);
      continue;
    }

    inHeader = false;

    if (indent % 2 !== 0) {
      addDiagnostic(
        DIAGNOSTICS.invalidIndentation,
        "error",
        "Indentation must use multiples of two spaces.",
        lineNumber,
        1,
        { suggestion: "Use two spaces for each nesting level." }
      );
      continue;
    }

    if (content.startsWith("- ") && isActiveListField(indent)) {
      const listField = listFields.get(indent);
      listField.values.push(content.slice(2).trim());
      continue;
    }

    if (content.startsWith("- ")) {
      parseNode(content, indent, lineNumber);
      continue;
    }

    const fieldMatch = content.match(FIELD_RE);
    if (fieldMatch) {
      parseField(fieldMatch, indent, lineNumber);
      continue;
    }

    const malformedField = content.match(/^([^:\s]+):/u);
    if (malformedField) {
      addFieldKeyDiagnostic(malformedField[1], undefined, indent, lineNumber);
      continue;
    }

    addDiagnostic(
      DIAGNOSTICS.invalidIndentation,
      "error",
      `Could not parse line: ${content}`,
      lineNumber,
      indent + 1
    );
  }

  if (formatVersion !== FORMAT_VERSION) {
    addDiagnostic(
      DIAGNOSTICS.unsupportedFormatVersion,
        "error",
        `Unsupported .ontos format version: ${formatVersion}`,
        1,
        1,
        { suggestion: `Use @ontos ${FORMAT_VERSION} for this parser.` }
      );
  }

  if (!metadata.title) {
    addDiagnostic(
      DIAGNOSTICS.missingRequiredHeader,
      "error",
      "Missing required @title header.",
      1,
      1,
      { suggestion: "Add @title before the first node." }
    );
  }

  const idMap = new Map();
  walkNodeArray(nodes, (node) => {
    if (!node.id) {
      return;
    }
    if (idMap.has(node.id)) {
      addDiagnostic(
        DIAGNOSTICS.duplicateNodeId,
        "error",
        `Duplicate node ID: ${node.id}.`,
        1,
        1,
        { nodeId: node.id }
      );
    } else {
      idMap.set(node.id, node);
    }
  });

  const references = collectReferences({ nodes });
  for (const reference of references) {
    if (reference.kind === "node" && !idMap.has(reference.target)) {
      addDiagnostic(
        DIAGNOSTICS.brokenNodeReference,
        "error",
        `Broken node reference: ${reference.target}.`,
        1,
        1
      );
    }

    if (reference.kind === "field") {
      const [nodeId, field] = reference.target.split(".");
      const node = idMap.get(nodeId);
      if (!node || !(field in node.fields)) {
        addDiagnostic(
          DIAGNOSTICS.brokenFieldReference,
          "error",
          `Broken field reference: ${reference.target}.`,
          1,
          1
        );
      }
    }
  }

  applySemanticDiagnostics();

  return finalizeAst();

  function finalizeAst() {
    const ast = buildAst();
    if (options.mode === "strict" && hasErrorDiagnostics(diagnostics)) {
      throw new OntosParseError("Strict .ontos parse failed.", diagnostics, ast);
    }
    return ast;
  }

  function parseHeader(content, lineNumber) {
    const match = content.match(HEADER_RE);
    if (!match) {
      addDiagnostic(
        DIAGNOSTICS.invalidHeaderKey,
        "error",
        `Invalid header syntax: ${content}.`,
        lineNumber,
        1,
        {
          suggestion: "Use @key value with lowercase letters, digits, and hyphens in the key."
        }
      );
      return;
    }

    const [, key, rawValue = ""] = match;
    const value = rawValue.trim();

    if (seenHeaders.has(key)) {
      addDiagnostic(
        DIAGNOSTICS.duplicateHeader,
        "warning",
        `Duplicate header: @${key}.`,
        lineNumber
      );
    }
    seenHeaders.add(key);

    if (key === "ontos") {
      formatVersion = value || FORMAT_VERSION;
      return;
    }

    metadata[key] = value;
  }

  function parseNode(content, indent, lineNumber) {
    const depth = indent / 2;
    if (depth > maxDepth) {
      addDiagnostic(
        DIAGNOSTICS.maxDepthExceeded,
        "error",
        `Node nesting exceeds maximum depth of ${maxDepth}.`,
        lineNumber,
        1
      );
      return;
    }

    const raw = content.slice(2).trim();
    let title = raw;
    let id;
    const tags = [];

    for (const match of raw.matchAll(NODE_ID_RE)) {
      id = match[1];
      if (!ID_RE.test(id)) {
        addDiagnostic(
          DIAGNOSTICS.invalidNodeId,
          "error",
          `Invalid node ID: ${id}.`,
          lineNumber,
          indent + match.index + 1,
          { suggestion: `Use @id(${createStableNodeId(id)}).` }
        );
      }
    }

    for (const match of raw.matchAll(TAG_CANDIDATE_RE)) {
      const tag = match[2];
      if (ISSUE_NUMBER_RE.test(tag)) {
        continue;
      }
      if (!TAG_RE.test(tag)) {
        addDiagnostic(
          DIAGNOSTICS.invalidTag,
          "error",
          `Invalid tag: ${tag}.`,
          lineNumber,
          indent + match.index + match[1].length + 1,
          { suggestion: `Use #${createStableNodeId(tag)}.` }
        );
      } else if (!tags.includes(tag)) {
        tags.push(tag);
      }
    }

    title = title
      .replace(NODE_ID_RE, "")
      .replace(TAG_CANDIDATE_RE, (token, leading, tag) => (TAG_RE.test(tag) ? leading : token))
      .trim();
    if (!title) {
      addDiagnostic(
        DIAGNOSTICS.emptyNodeTitle,
        "error",
        "Node title cannot be empty.",
        lineNumber,
        indent + 1
      );
    }

    while (stack.length > 0 && stack[stack.length - 1].indent >= indent) {
      stack.pop();
    }

    if (indent > 0 && stack.length === 0) {
      addDiagnostic(
        DIAGNOSTICS.invalidIndentation,
        "error",
        "Nested node has no parent.",
        lineNumber,
        1
      );
    }

    const parent = stack[stack.length - 1]?.node;
    if (parent && indent > stack[stack.length - 1].indent + 2) {
      addDiagnostic(
        DIAGNOSTICS.invalidIndentation,
        "error",
        "Node indentation jumps more than one level.",
        lineNumber,
        1
      );
    }

    const node = {
      ...(id ? { id } : {}),
      title,
      tags,
      fields: {},
      children: [],
      ...(options.includeSourceLocations
        ? { source: sourceRange(lineNumber, indent + 1, lineNumber, raw.length + indent + 1) }
        : {})
    };

    if (parent) {
      parent.children.push(node);
    } else {
      nodes.push(node);
    }

    stack.push({ indent, node });
  }

  function buildAst() {
    const ast = {
      schemaVersion: "1.0",
      formatVersion,
      metadata,
      nodes
    };

    if (options.includeDiagnostics !== false && diagnostics.length > 0) {
      ast.diagnostics = diagnostics;
    }

    if (options.preserveComments && comments.length > 0) {
      ast.comments = comments;
    }

    return ast;
  }

  function parseField(match, indent, lineNumber) {
    const [, key, rawValue = ""] = match;
    const owner = nearestNodeForField(indent);

    if (!owner) {
      addDiagnostic(
        DIAGNOSTICS.invalidIndentation,
        "error",
        `Field has no owning node: ${key}.`,
        lineNumber,
        indent + 1
      );
      return;
    }

    if (Object.hasOwn(owner.fields, key)) {
      addDiagnostic(
        DIAGNOSTICS.duplicateField,
        "warning",
        `Duplicate field: ${key}.`,
        lineNumber,
        indent + 1,
        { nodeId: owner.id, field: key }
      );
    }

    addFieldKeyDiagnostic(key, owner, indent, lineNumber);

    const value = rawValue.trim();
    if (value === "|") {
      owner.fields[key] = {
        kind: "text",
        value: readIndentedBlock(indent, lineNumber, key)
      };
      listFields.delete(indent + 2);
      return;
    }

    const codeFence = value.match(/^```([a-zA-Z0-9_-]+)?$/);
    if (codeFence) {
      owner.fields[key] = {
        kind: "code",
        value: readCodeBlock(indent, lineNumber, key),
        ...(codeFence[1] ? { language: codeFence[1] } : {})
      };
      listFields.delete(indent + 2);
      return;
    }

    if (value === "") {
      const values = [];
      owner.fields[key] = values;
      listFields.set(indent + 2, { node: owner, key, values });
    } else {
      owner.fields[key] = value;
      listFields.delete(indent + 2);
    }
  }

  function addFieldKeyDiagnostic(key, owner, indent, lineNumber) {
    if (/^_|^ontos_/u.test(key)) {
      addDiagnostic(
        DIAGNOSTICS.reservedFieldMisuse,
        "error",
        `Reserved field key is not allowed: ${key}.`,
        lineNumber,
        indent + 1,
        {
          nodeId: owner?.id,
          field: key,
          suggestion: "Use a custom field that starts with a lowercase letter and does not use a reserved prefix."
        }
      );
      return;
    }

    if (!/^[a-z][a-z0-9_]*$/.test(key)) {
      addDiagnostic(
        DIAGNOSTICS.invalidFieldKey,
        "error",
        `Invalid field key: ${key}.`,
        lineNumber,
        indent + 1,
        {
          nodeId: owner?.id,
          field: key,
          suggestion: `Use ${createStableNodeId(key).replaceAll("-", "_")} as the field key.`
        }
      );
    }
  }

  function applySemanticDiagnostics() {
    const type = metadata.type;
    if (type && !KNOWN_DOCUMENT_TYPES.has(type)) {
      addDiagnostic(
        DIAGNOSTICS.unknownDocumentType,
        "warning",
        `Unknown document type: ${type}.`,
        1,
        1,
        { suggestion: "Use a documented @type or keep the custom type intentionally." }
      );
    }

    const deprecatedFields = options.deprecatedFields ?? {};
    walkNodeArray(nodes, (node) => {
      if (options.requireNodeIds && !node.id) {
        addDiagnostic(
          DIAGNOSTICS.missingRequiredNodeId,
          "error",
          `Node is missing required ID: ${node.title}.`,
          1,
          1,
          { nodeId: node.id, suggestion: `Add @id(${createStableNodeId(node.title)}).` }
        );
      }

      if (options.checkRecommendedFields && type && RECOMMENDED_FIELDS[type]) {
        for (const field of RECOMMENDED_FIELDS[type]) {
          if (!Object.hasOwn(node.fields ?? {}, field)) {
            addDiagnostic(
              DIAGNOSTICS.missingRecommendedField,
              "warning",
              `Recommended field missing for ${type}: ${field}.`,
              1,
              1,
              { nodeId: node.id, field }
            );
          }
        }
      }

      for (const [field, value] of Object.entries(node.fields ?? {})) {
        if (Object.hasOwn(deprecatedFields, field)) {
          addDiagnostic(
            DIAGNOSTICS.deprecatedField,
            "warning",
            `Deprecated field: ${field}.`,
            1,
            1,
            {
              nodeId: node.id,
              field,
              suggestion: deprecatedFields[field] ? `Use ${deprecatedFields[field]} instead.` : undefined
            }
          );
        }

        for (const textValue of flattenFieldValues(value)) {
          if (isUnsafeFileReference(field, textValue)) {
            addDiagnostic(
              DIAGNOSTICS.invalidFileReference,
              "warning",
              `Potentially unsafe file reference: ${textValue}.`,
              1,
              1,
              {
                nodeId: node.id,
                field,
                suggestion: "Use a repository-relative path when possible."
              }
            );
          }

          if (hasUnsafeExportContent(textValue)) {
            addDiagnostic(
              DIAGNOSTICS.unsafeExportContent,
              "warning",
              `Field contains content that requires safe export handling: ${field}.`,
              1,
              1,
              {
                nodeId: node.id,
                field,
                suggestion: "Use trusted exporters that escape HTML, XML, and URL-sensitive text."
              }
            );
          }
        }
      }
    });

    if (options.checkFormatting && serializeOntosDocument(buildAst()) !== text) {
      addDiagnostic(
        DIAGNOSTICS.nonCanonicalFormatting,
        "info",
        "Document is valid but not canonical formatted.",
        1,
        1,
        { suggestion: "Run ontosfmt format --write <file>." }
      );
    }
  }

  function readIndentedBlock(fieldIndent, lineNumber, key) {
    const blockIndent = fieldIndent + 2;
    const values = [];
    let cursor = index + 1;
    while (cursor < lines.length) {
      const raw = lines[cursor];
      if (raw.trim() === "") {
        values.push("");
        cursor += 1;
        continue;
      }
      const leading = raw.match(/^[ \t]*/)?.[0] ?? "";
      if (leading.includes("\t")) {
        addDiagnostic(
          DIAGNOSTICS.tabIndentation,
          "error",
          "Tabs are not allowed for indentation.",
          cursor + 1,
          leading.indexOf("\t") + 1
        );
      }
      const indent = countLeadingSpaces(raw);
      if (indent <= fieldIndent) {
        break;
      }
      if (indent < blockIndent) {
        addDiagnostic(
          DIAGNOSTICS.invalidMultilineField,
          "error",
          `Multiline field ${key} must indent content at least two spaces beyond the field.`,
          cursor + 1,
          indent + 1,
          { field: key }
        );
        break;
      }
      values.push(raw.slice(blockIndent));
      cursor += 1;
    }
    while (values.at(-1) === "") {
      values.pop();
    }
    index = cursor - 1;
    if (values.length === 0) {
      addDiagnostic(
        DIAGNOSTICS.invalidMultilineField,
        "warning",
        `Multiline field ${key} has no content.`,
        lineNumber,
        fieldIndent + 1,
        { field: key }
      );
    }
    return values.join("\n");
  }

  function readCodeBlock(fieldIndent, lineNumber, key) {
    const blockIndent = fieldIndent + 2;
    const values = [];
    let cursor = index + 1;
    let closed = false;
    while (cursor < lines.length) {
      const raw = lines[cursor];
      const leading = raw.match(/^[ \t]*/)?.[0] ?? "";
      if (leading.includes("\t")) {
        addDiagnostic(
          DIAGNOSTICS.tabIndentation,
          "error",
          "Tabs are not allowed for indentation.",
          cursor + 1,
          leading.indexOf("\t") + 1
        );
      }
      if (raw.trim() === "") {
        values.push("");
        cursor += 1;
        continue;
      }
      const indent = countLeadingSpaces(raw);
      if (indent <= fieldIndent) {
        break;
      }
      if (indent < blockIndent) {
        addDiagnostic(
          DIAGNOSTICS.invalidCodeField,
          "error",
          `Code field ${key} must indent content at least two spaces beyond the field.`,
          cursor + 1,
          indent + 1,
          { field: key }
        );
        break;
      }
      const content = raw.slice(blockIndent);
      if (content.trim() === "```") {
        closed = true;
        cursor += 1;
        break;
      }
      values.push(content);
      cursor += 1;
    }
    index = cursor - 1;
    if (!closed) {
      addDiagnostic(
        DIAGNOSTICS.invalidCodeField,
        "error",
        `Code field ${key} is missing a closing fence.`,
        lineNumber,
        fieldIndent + 1,
        { field: key }
      );
    }
    return values.join("\n");
  }

  function nearestNodeForField(indent) {
    while (stack.length > 0 && stack[stack.length - 1].indent >= indent) {
      stack.pop();
    }
    return stack[stack.length - 1]?.node;
  }

  function isActiveListField(indent) {
    const listField = listFields.get(indent);
    return Boolean(listField && stack[stack.length - 1]?.node === listField.node);
  }
}

export function validateOntosDocument(astOrText, options = {}) {
  const ast =
    typeof astOrText === "string"
      ? parseOntosDocument(astOrText, options)
      : astOrText;
  return ast.diagnostics ?? [];
}

export function serializeOntosDocument(ast, options = {}) {
  const lines = [];
  const version = ast.formatVersion ?? FORMAT_VERSION;
  lines.push(`@ontos ${version}`);
  if (ast.metadata?.title) {
    lines.push(`@title ${ast.metadata.title}`);
  }

  for (const [key, value] of Object.entries(ast.metadata ?? {})) {
    if (key === "title") {
      continue;
    }
    if (value !== undefined && value !== null && value !== "") {
      lines.push(`@${key} ${value}`);
    }
  }

  if (ast.nodes?.length) {
    lines.push("");
    for (const node of ast.nodes) {
      serializeNode(node, 0, lines);
    }
  }

  const output = lines.join("\n");
  return options.finalNewline === false ? output : `${output}\n`;
}

export function formatOntosDocument(text, options = {}) {
  const ast = parseOntosDocument(text, { includeDiagnostics: true });
  const diagnostics = ast.diagnostics ?? [];
  if (hasErrorDiagnostics(diagnostics)) {
    throw new OntosParseError("Cannot format invalid .ontos document.", diagnostics, ast);
  }
  return serializeOntosDocument(ast, options);
}

export function findNode(ast, selector) {
  if (typeof selector === "string") {
    return findNodeById(ast, selector);
  }
  if (selector?.id) {
    return findNodeById(ast, selector.id);
  }
  return undefined;
}

export function findNodeById(ast, nodeId) {
  let found;
  walkNodes(ast, (node) => {
    if (!found && node.id === nodeId) {
      found = node;
    }
  });
  return found;
}

export function getNodePath(ast, nodeId) {
  const path = [];
  const visit = (nodes, ancestors) => {
    for (const node of nodes ?? []) {
      const next = [...ancestors, node.title];
      if (node.id === nodeId) {
        path.push(...next);
        return true;
      }
      if (visit(node.children, next)) {
        return true;
      }
    }
    return false;
  };
  visit(ast.nodes, []);
  return path;
}

export function getNodeText(ast, nodeId) {
  const node = findNodeById(ast, nodeId);
  if (!node) {
    return "";
  }
  const lines = [];
  serializeNode(node, 0, lines);
  return `${lines.join("\n")}\n`;
}

export function walkNodes(ast, visitor) {
  walkNodeArray(ast.nodes ?? [], visitor);
}

export function collectReferences(ast) {
  const references = [];
  walkNodeArray(ast.nodes ?? [], (node) => {
    for (const [field, value] of Object.entries(node.fields ?? {})) {
      for (const target of extractReferences(value)) {
        references.push({
          kind: target.includes(".") ? "field" : "node",
          target,
          nodeId: node.id,
          field
        });
      }
    }
  });
  return references;
}

export function createStableNodeId(title, options = {}) {
  const existingIds = new Set(options.existingIds ?? []);
  const maxLength = positiveIntegerOption(options.maxLength, 64);
  const fallback = normalizeIdSegment(options.fallback ?? "node") || "node";
  const base =
    normalizeIdSegment(title)
      .replace(/^-+|-+$/gu, "")
      .slice(0, maxLength)
      .replace(/-+$/gu, "") || fallback;
  let candidate = base;
  let counter = 2;
  while (existingIds.has(candidate)) {
    const suffix = `-${counter}`;
    candidate = `${base.slice(0, Math.max(1, maxLength - suffix.length)).replace(/-+$/gu, "")}${suffix}`;
    counter += 1;
  }
  return candidate;
}

function serializeNode(node, indent, lines) {
  const prefix = " ".repeat(indent);
  const id = node.id ? ` @id(${node.id})` : "";
  const tags = node.tags?.length ? ` ${node.tags.map((tag) => `#${tag}`).join(" ")}` : "";
  lines.push(`${prefix}- ${node.title}${id}${tags}`);

  for (const [key, value] of Object.entries(node.fields ?? {})) {
    serializeField(key, value, indent + 2, lines);
  }

  for (const child of node.children ?? []) {
    lines.push("");
    serializeNode(child, indent + 2, lines);
  }
}

function serializeField(key, value, indent, lines) {
  const prefix = " ".repeat(indent);
  if (Array.isArray(value)) {
    lines.push(`${prefix}${key}:`);
    for (const item of value) {
      lines.push(`${prefix}  - ${item}`);
    }
    return;
  }

  if (value && typeof value === "object" && "kind" in value) {
    if (value.kind === "code") {
      const language = value.language ? String(value.language) : "";
      lines.push(`${prefix}${key}: \`\`\`${language}`);
      for (const line of String(value.value ?? "").split("\n")) {
        lines.push(`${prefix}  ${line}`);
      }
      lines.push(`${prefix}  \`\`\``);
      return;
    }
    if (value.kind === "text") {
      lines.push(`${prefix}${key}: |`);
      for (const line of String(value.value ?? "").split("\n")) {
        lines.push(`${prefix}  ${line}`);
      }
      return;
    }
    if (value.kind === "list" && Array.isArray(value.value)) {
      lines.push(`${prefix}${key}:`);
      for (const item of value.value) {
        lines.push(`${prefix}  - ${item}`);
      }
      return;
    }
    lines.push(`${prefix}${key}: ${String(value.value ?? "")}`);
    return;
  }

  lines.push(`${prefix}${key}: ${String(value ?? "")}`);
}

function countLeadingSpaces(line) {
  let count = 0;
  while (line[count] === " ") {
    count += 1;
  }
  return count;
}

function utf8ByteLength(value) {
  if (typeof TextEncoder !== "undefined") {
    return new TextEncoder().encode(value).length;
  }
  return unescape(encodeURIComponent(value)).length;
}

function positiveIntegerOption(value, fallback) {
  return Number.isInteger(value) && value > 0 ? value : fallback;
}

function nonNegativeIntegerOption(value, fallback) {
  return Number.isInteger(value) && value >= 0 ? value : fallback;
}

function hasErrorDiagnostics(diagnostics) {
  return diagnostics.some((diagnostic) => diagnostic.severity === "error");
}

function normalizeIdSegment(value) {
  const normalized = String(value ?? "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/gu, "-")
    .replace(/^-+|-+$/gu, "");
  if (!normalized) {
    return "";
  }
  return /^[a-z]/u.test(normalized) ? normalized : `node-${normalized}`;
}

function walkNodeArray(nodes, visitor) {
  for (const node of nodes ?? []) {
    visitor(node);
    walkNodeArray(node.children, visitor);
  }
}

function extractReferences(value) {
  const richValue = value && typeof value === "object" && "value" in value ? value.value : value;
  const strings = Array.isArray(richValue) ? richValue : [richValue];
  const references = [];
  for (const item of strings) {
    if (typeof item !== "string") {
      continue;
    }
    for (const match of item.matchAll(REF_RE)) {
      references.push(match[1]);
    }
  }
  return references;
}

function flattenFieldValues(value) {
  if (value && typeof value === "object" && "value" in value) {
    return flattenFieldValues(value.value);
  }
  if (Array.isArray(value)) {
    return value.flatMap(flattenFieldValues);
  }
  return typeof value === "string" ? [value] : [];
}

function isUnsafeFileReference(field, value) {
  if (!["file", "source", "frontend", "backend", "api", "data"].includes(field)) {
    return false;
  }
  return /^(file:\/\/|~\/|\/)|\0/u.test(value);
}

function hasUnsafeExportContent(value) {
  return /<\s*script\b|javascript:|onerror\s*=|onload\s*=/iu.test(value);
}

function sourceRange(startLine, startColumn, endLine, endColumn) {
  return {
    start: { line: startLine, column: startColumn },
    end: { line: endLine, column: endColumn }
  };
}
