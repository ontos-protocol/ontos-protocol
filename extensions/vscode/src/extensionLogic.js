import { parseOntosDocument } from "@ontos-protocol/parser";

export function nodeInfoAtLine(documentOrSource, line) {
  const index = buildNodeIndex(documentOrSource);
  const candidates = index.nodes
    .filter((item) => item.line <= line && item.endLine >= line)
    .sort((left, right) => right.line - left.line || right.indent - left.indent);
  return candidates[0];
}

export function buildNodeIndex(documentOrSource) {
  const source = documentText(documentOrSource);
  const lines = source.split(/\r?\n/u);
  const ast = parseOntosDocument(source, { includeDiagnostics: false });
  const flatNodes = flattenNodes(ast.nodes ?? [], []);
  const sourceStarts = collectSourceNodeStarts(lines);
  let searchFrom = 0;

  const indexed = flatNodes.map((item) => {
    const found = findSourceStart(sourceStarts, item.node.title, searchFrom);
    if (found) {
      searchFrom = found.index + 1;
    }
    return {
      ...item,
      line: found?.line ?? findTitleLine(lines, item.node.title),
      indent: found?.indent ?? 0,
      endLine: lines.length - 1,
      text: ""
    };
  }).sort((left, right) => left.line - right.line);

  for (const item of indexed) {
    const next = indexed.find((candidate) =>
      candidate.line > item.line && candidate.indent <= item.indent
    );
    item.endLine = next ? next.line - 1 : lines.length - 1;
    item.text = `${lines.slice(item.line, item.endLine + 1).join("\n").trimEnd()}\n`;
  }

  return { ast, nodes: indexed };
}

export function createTransientNodePack(ast, info, kind) {
  return {
    kind,
    document: ast.metadata?.title ?? "Untitled",
    nodeId: `<no-id:line-${info.line + 1}>`,
    path: info.path,
    fields: {
      ...info.node.fields,
      note: "This pack was created from a node without @id(...). Add a stable ID for durable references."
    },
    linkedReferences: [],
    sourceReferences: [],
    text: info.text
  };
}

function documentText(documentOrSource) {
  return typeof documentOrSource === "string"
    ? documentOrSource
    : documentOrSource.getText();
}

function flattenNodes(nodes, ancestors) {
  return (nodes ?? []).flatMap((node) => {
    const path = [...ancestors, node.title];
    return [
      { node, path },
      ...flattenNodes(node.children, path)
    ];
  });
}

function collectSourceNodeStarts(lines) {
  return lines
    .map((line, index) => {
      const match = line.match(/^(\s*)-\s+(.+)$/u);
      if (!match) {
        return undefined;
      }
      return {
        line: index,
        indent: match[1].length,
        title: normalizeNodeTitle(match[2])
      };
    })
    .filter(Boolean);
}

function findSourceStart(sourceStarts, title, searchFrom) {
  const normalized = normalizeNodeTitle(title);
  const exactIndex = sourceStarts.findIndex((item, index) => index >= searchFrom && item.title === normalized);
  if (exactIndex !== -1) {
    return {
      ...sourceStarts[exactIndex],
      index: exactIndex
    };
  }
  const fallbackIndex = sourceStarts.findIndex((_, index) => index >= searchFrom);
  return fallbackIndex === -1
    ? undefined
    : {
        ...sourceStarts[fallbackIndex],
        index: fallbackIndex
      };
}

function normalizeNodeTitle(value) {
  return String(value)
    .replace(/@id\([^)]+\)/gu, "")
    .replace(/#[a-z][a-z0-9-]*/giu, "")
    .trim();
}

function findTitleLine(lines, title) {
  const index = lines.findIndex((line) => line.includes(title));
  return Math.max(index, 0);
}
