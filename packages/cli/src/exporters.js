export function exportJson(ast) {
  return `${JSON.stringify(ast, null, 2)}\n`;
}

export function exportMarkdown(ast, options = {}) {
  const headingOffset = nonNegativeInteger(options.headingOffset, 0);
  const titleDepth = Math.min(6, 1 + headingOffset);
  const lines = [];
  if (options.frontMatter) {
    lines.push("---");
    for (const [key, value] of Object.entries(ast.metadata ?? {})) {
      lines.push(`${key}: ${frontMatterValue(value)}`);
    }
    lines.push("---", "");
  }
  lines.push(`${"#".repeat(titleDepth)} ${ast.metadata.title ?? "Untitled"}`, "");
  if (options.toc) {
    lines.push("## Table of Contents", "");
    for (const node of ast.nodes ?? []) {
      markdownTocNode(node, 0, lines);
    }
    lines.push("");
  }
  for (const node of ast.nodes ?? []) {
    markdownNode(node, Math.min(6, titleDepth + 1), lines);
  }
  return `${lines.join("\n")}\n`;
}

export function exportHtml(ast, options = {}) {
  const body = (ast.nodes ?? []).map((node) => htmlNode(node, 0)).join("\n");
  const searchIndex = options.searchIndex
    ? `\n  <script type="application/json" id="ontos-search-index">${jsonScript(searchIndexFor(ast))}</script>`
    : "";
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>${escapeHtml(ast.metadata.title ?? "Untitled")}</title>
  <style>
    body { font-family: system-ui, sans-serif; line-height: 1.5; margin: 2rem; }
    details { margin-left: 1rem; }
    summary { cursor: pointer; font-weight: 600; }
    code { background: #f4f4f4; padding: 0.1rem 0.25rem; }
  </style>
</head>
<body data-ontos-standalone="true">
  <h1>${escapeHtml(ast.metadata.title ?? "Untitled")}</h1>
${body}
${searchIndex}
</body>
</html>
`;
}

export function exportOpml(ast, options = {}) {
  const outlines = (ast.nodes ?? []).map((node) => opmlNode(node, 2, options)).join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>
<opml version="2.0">
  <head>
    <title>${escapeXml(ast.metadata.title ?? "Untitled")}</title>
  </head>
  <body>
${outlines}
  </body>
</opml>
`;
}

function markdownNode(node, depth, lines) {
  const id = node.id ? ` {#${node.id}}` : "";
  lines.push(`${"#".repeat(depth)} ${node.title}${id}`);
  lines.push("");
  if (node.tags?.length) {
    lines.push(`Tags: ${node.tags.map((tag) => `#${tag}`).join(" ")}`);
    lines.push("");
  }
  for (const [key, value] of Object.entries(node.fields ?? {})) {
    lines.push(`**${key}:**`);
    lines.push("");
    appendMarkdownValue(value, lines);
    lines.push("");
  }
  for (const child of node.children ?? []) {
    markdownNode(child, depth + 1, lines);
  }
}

function markdownTocNode(node, depth, lines) {
  const indent = "  ".repeat(depth);
  const target = node.id ? `#${node.id}` : slugify(node.title);
  lines.push(`${indent}- [${node.title}](${target})`);
  for (const child of node.children ?? []) {
    markdownTocNode(child, depth + 1, lines);
  }
}

function appendMarkdownValue(value, lines) {
  if (isRichField(value)) {
    if (value.kind === "code") {
      const language = value.language ? String(value.language) : "";
      lines.push(`\`\`\`${language}`);
      lines.push(String(value.value ?? ""));
      lines.push("```");
      return;
    }
    appendMarkdownValue(value.value, lines);
    return;
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      lines.push(`- ${item}`);
    }
  } else {
    lines.push(String(value ?? ""));
  }
}

function htmlNode(node, depth) {
  const pad = "  ".repeat(depth);
  const childPad = "  ".repeat(depth + 1);
  const id = node.id ? ` id="${escapeHtml(node.id)}"` : "";
  const tagAttribute = node.tags?.length
    ? ` data-tags="${escapeHtml(node.tags.join(" "))}" class="${node.tags.map((tag) => `tag-${className(tag)}`).join(" ")}"`
    : "";
  const fields = Object.entries(node.fields ?? {})
    .map(([key, value]) => `${childPad}<section data-field="${escapeHtml(key)}">
${childPad}  <h3>${escapeHtml(key)}</h3>
${htmlFieldValue(value, depth + 1)}
${childPad}</section>`)
    .join("\n");
  const children = (node.children ?? [])
    .map((child) => htmlNode(child, depth + 1))
    .join("\n");
  const body = [fields, children].filter(Boolean).join("\n");
  return `${pad}<details open${id}${tagAttribute}>
${childPad}<summary>${escapeHtml(node.title)}</summary>
${body}
${pad}</details>`;
}

function htmlFieldValue(value, depth) {
  const pad = "  ".repeat(depth + 1);
  if (isRichField(value)) {
    if (value.kind === "code") {
      const language = value.language ? ` class="language-${escapeHtml(value.language)}"` : "";
      return `${pad}<pre><code${language}>${escapeHtml(value.value ?? "")}</code></pre>`;
    }
    return htmlFieldValue(value.value, depth);
  }

  if (Array.isArray(value)) {
    const items = value.map((item) => `${pad}  <li>${escapeHtml(item)}</li>`).join("\n");
    return `${pad}<ul>
${items}
${pad}</ul>`;
  }
  return `${pad}<p>${escapeHtml(valueToText(value))}</p>`;
}

function opmlNode(node, indent, options = {}) {
  const pad = " ".repeat(indent);
  const id = node.id ? ` _id="${escapeXml(node.id)}"` : "";
  const selectedFields = new Set(options.fields ?? []);
  const fieldAttributes = [...selectedFields]
    .filter((field) => Object.hasOwn(node.fields ?? {}, field))
    .map((field) => ` _field_${escapeXml(field)}="${escapeXml(valueToText(node.fields[field]))}"`)
    .join("");
  const children = (node.children ?? [])
    .map((child) => opmlNode(child, indent + 2, options))
    .join("\n");
  if (!children) {
    return `${pad}<outline text="${escapeXml(node.title)}"${id}${fieldAttributes}/>`;
  }
  return `${pad}<outline text="${escapeXml(node.title)}"${id}${fieldAttributes}>
${children}
${pad}</outline>`;
}

function valueToText(value) {
  if (isRichField(value)) {
    return valueToText(value.value);
  }
  return Array.isArray(value) ? value.join("\n") : String(value ?? "");
}

function isRichField(value) {
  return Boolean(value && typeof value === "object" && "kind" in value && "value" in value);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function escapeXml(value) {
  return escapeHtml(value).replaceAll("'", "&apos;");
}

function frontMatterValue(value) {
  if (value === null || typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  return JSON.stringify(String(value ?? ""));
}

function searchIndexFor(ast) {
  const rows = [];
  const visit = (nodes, path) => {
    for (const node of nodes ?? []) {
      const nextPath = [...path, node.title];
      rows.push({
        id: node.id,
        title: node.title,
        tags: node.tags ?? [],
        path: nextPath,
        fields: Object.keys(node.fields ?? {})
      });
      visit(node.children, nextPath);
    }
  };
  visit(ast.nodes, []);
  return rows;
}

function slugify(value) {
  return `#${String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/gu, "-")
    .replace(/^-+|-+$/gu, "")}`;
}

function className(value) {
  return String(value).replace(/[^a-z0-9-]/giu, "-").toLowerCase();
}

function nonNegativeInteger(value, fallback) {
  return Number.isInteger(value) && value >= 0 ? value : fallback;
}

function jsonScript(value) {
  return JSON.stringify(value)
    .replaceAll("<", "\\u003c")
    .replaceAll(">", "\\u003e")
    .replaceAll("&", "\\u0026");
}
