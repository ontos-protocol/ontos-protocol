import { XMLParser } from "fast-xml-parser";
import { formatOntosDocument } from "@ontos-protocol/parser";

export function convertMarkdownToOntos(markdown, fallbackTitle) {
  return convertMarkdownToOntosResult(markdown, fallbackTitle).document;
}

export function convertMarkdownToOntosResult(markdown, fallbackTitle) {
  const lines = markdown.replace(/\r\n?/g, "\n").split("\n");
  const frontMatter = parseFrontMatter(lines);
  const contentLines = lines.slice(frontMatter.endIndex);
  const nextId = createIdFactory();
  const report = {
    source: "markdown",
    headings: 0,
    paragraphs: 0,
    bulletLists: 0,
    orderedLists: 0,
    codeBlocks: 0,
    tables: 0,
    blockquotes: 0,
    frontMatterFields: Object.keys(frontMatter.fields).length,
    warnings: []
  };
  const output = [
    "@ontos 1.0",
    `@title ${safeInlineText(titleFromMarkdown(contentLines, frontMatter.fields.title ?? fallbackTitle))}`,
    "@type imported-markdown"
  ];

  for (const [key, value] of Object.entries(frontMatter.fields)) {
    output.push(`@source-${headerKey(key)} ${safeInlineText(value)}`);
  }
  output.push("");

  const stack = [];
  let paragraph = [];
  let list = null;
  let code = null;
  let table = [];
  let quote = [];

  function currentNode() {
    return stack.at(-1);
  }

  function flushParagraph() {
    if (paragraph.length === 0 || stack.length === 0) {
      paragraph = [];
      return;
    }
    appendField(currentNode(), "body", paragraph.join(" "));
    report.paragraphs += 1;
    paragraph = [];
  }

  function flushList() {
    if (!list || stack.length === 0) {
      list = null;
      return;
    }
    appendListField(currentNode(), list.kind === "ordered" ? "ordered" : "items", list.items);
    if (list.kind === "ordered") {
      report.orderedLists += 1;
    } else {
      report.bulletLists += 1;
    }
    list = null;
  }

  function flushCode() {
    if (!code || stack.length === 0) {
      code = null;
      return;
    }
    if (code.language) {
      appendField(currentNode(), "code_language", code.language);
    }
    appendListField(currentNode(), "code", code.lines.length > 0 ? code.lines : [""]);
    report.codeBlocks += 1;
    code = null;
  }

  function flushTable() {
    if (table.length === 0 || stack.length === 0) {
      table = [];
      return;
    }
    appendListField(currentNode(), "table", table);
    report.tables += 1;
    table = [];
  }

  function flushQuote() {
    if (quote.length === 0 || stack.length === 0) {
      quote = [];
      return;
    }
    appendListField(currentNode(), "quote", quote);
    report.blockquotes += 1;
    quote = [];
  }

  function flushBlocks() {
    flushParagraph();
    flushList();
    flushCode();
    flushTable();
    flushQuote();
  }

  for (const line of contentLines) {
    if (code) {
      if (line.startsWith("```")) {
        flushCode();
      } else {
        code.lines.push(safeInlineText(line));
      }
      continue;
    }

    const heading = line.match(/^(#{1,6})\s+(.+)$/);
    if (heading) {
      flushBlocks();
      const level = heading[1].length;
      const title = safeInlineText(heading[2]);
      while (stack.length > 0 && stack[stack.length - 1].level >= level) {
        stack.pop();
      }
      if (stack.length + 1 < level) {
        report.warnings.push({
          code: "MD001",
          message: `Heading level jumps to h${level}: ${title}`
        });
      }
      const id = nextId(title);
      const node = {
        level,
        indent: " ".repeat(stack.length * 2),
        output,
        fields: new Map()
      };
      output.push(`${node.indent}- ${title} @id(${id})`);
      stack.push(node);
      report.headings += 1;
      continue;
    }

    if (line.trim() === "") {
      flushBlocks();
      continue;
    }

    const fence = line.match(/^```([^`]*)$/);
    if (fence) {
      flushBlocks();
      code = {
        language: safeInlineText(fence[1]),
        lines: []
      };
      continue;
    }

    const unordered = line.match(/^\s*[-*+]\s+(.+)$/);
    if (unordered) {
      flushParagraph();
      flushTable();
      flushQuote();
      if (!list || list.kind !== "bullet") {
        flushList();
        list = { kind: "bullet", items: [] };
      }
      list.items.push(safeInlineText(unordered[1]));
      continue;
    }

    const ordered = line.match(/^\s*(\d+)[.)]\s+(.+)$/);
    if (ordered) {
      flushParagraph();
      flushTable();
      flushQuote();
      if (!list || list.kind !== "ordered") {
        flushList();
        list = { kind: "ordered", items: [] };
      }
      list.items.push(`${ordered[1]}. ${safeInlineText(ordered[2])}`);
      continue;
    }

    if (/^\s*\|.*\|\s*$/.test(line)) {
      flushParagraph();
      flushList();
      flushQuote();
      table.push(safeInlineText(line));
      continue;
    }

    const blockquote = line.match(/^>\s?(.*)$/);
    if (blockquote) {
      flushParagraph();
      flushList();
      flushTable();
      quote.push(safeInlineText(blockquote[1]));
      continue;
    }

    flushList();
    flushTable();
    flushQuote();
    if (/^<[^>]+>/.test(line.trim())) {
      report.warnings.push({
        code: "MD002",
        message: "Raw HTML was preserved as body text."
      });
    }
    paragraph.push(safeInlineText(line));
  }
  flushBlocks();
  return {
    document: normalizeOntosOutput(output),
    report
  };
}

export function convertOpmlToOntos(opml, fallbackTitle) {
  const parser = new XMLParser({
    attributeNamePrefix: "",
    ignoreAttributes: false,
    parseAttributeValue: false,
    parseTagValue: false,
    trimValues: true
  });
  const document = parser.parse(opml);
  const root = document?.opml;
  const outlines = asArray(root?.body?.outline);
  if (outlines.length === 0) {
    throw new Error("OPML document has no outline nodes.");
  }

  const nextId = createIdFactory();
  const output = [
    "@ontos 1.0",
    `@title ${safeInlineText(root?.head?.title ?? fallbackTitle)}`,
    "@type imported-opml",
    ""
  ];

  for (const outline of outlines) {
    appendOutline(outline, 0, output, nextId);
  }

  return normalizeOntosOutput(output);
}

function normalizeOntosOutput(lines) {
  return formatOntosDocument(`${lines.join("\n")}\n`);
}

function titleFromMarkdown(lines, fallbackTitle) {
  const heading = lines.find((line) => /^#\s+/.test(line));
  return heading ? heading.replace(/^#\s+/, "").trim() : fallbackTitle;
}

function appendOutline(outline, depth, output, nextId) {
  const title = safeInlineText(outline.text ?? outline.title ?? outline["#text"] ?? "Untitled");
  const explicitId = validId(outline._id) || validId(outline.id);
  const id = explicitId ? nextId(explicitId) : nextId(title);
  const indent = " ".repeat(depth * 2);
  output.push(`${indent}- ${title} @id(${id})`);

  for (const [key, value] of Object.entries(outlineAttributes(outline))) {
    output.push(`${indent}  ${key}: ${safeInlineText(value)}`);
  }

  for (const child of asArray(outline.outline)) {
    appendOutline(child, depth + 1, output, nextId);
  }
}

function appendField(node, key, value) {
  const field = nextFieldKey(node, key);
  outputLine(node, `${field}: ${safeInlineText(value)}`);
}

function appendListField(node, key, values) {
  const field = nextFieldKey(node, key);
  outputLine(node, `${field}:`);
  for (const value of values) {
    outputLine(node, `  - ${safeInlineText(value)}`);
  }
}

function outputLine(node, value) {
  node.output.push(`${node.indent}  ${value}`);
}

function nextFieldKey(node, key) {
  const count = node.fields.get(key) ?? 0;
  node.fields.set(key, count + 1);
  return count === 0 ? key : `${key}_${count + 1}`;
}

function parseFrontMatter(lines) {
  if (lines[0]?.trim() !== "---") {
    return { fields: {}, endIndex: 0 };
  }
  const fields = {};
  let endIndex = 0;
  for (let index = 1; index < lines.length; index += 1) {
    const line = lines[index];
    if (line.trim() === "---") {
      endIndex = index + 1;
      break;
    }
    const match = line.match(/^([A-Za-z][A-Za-z0-9_-]*):\s*(.*)$/);
    if (match) {
      fields[match[1]] = match[2];
    }
  }
  return { fields, endIndex };
}

function headerKey(value) {
  const key = String(value)
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return /^[a-z][a-z0-9-]*$/.test(key) ? key : "field";
}

function outlineAttributes(outline) {
  const fields = {};
  for (const [key, value] of Object.entries(outline)) {
    if (["outline", "text", "title", "_id", "id", "#text"].includes(key)) {
      continue;
    }
    if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
      fields[fieldKey(key)] = value;
    }
  }
  return fields;
}

function fieldKey(value) {
  const key = String(value)
    .toLowerCase()
    .replace(/[^a-z0-9_]+/g, "_")
    .replace(/^_+|_+$/g, "");
  return /^[a-z][a-z0-9_]*$/.test(key) ? key : "attribute";
}

function asArray(value) {
  if (value === undefined || value === null) {
    return [];
  }
  return Array.isArray(value) ? value : [value];
}

function createIdFactory() {
  const counts = new Map();
  return (value) => {
    const base = slugify(value);
    const count = counts.get(base) ?? 0;
    counts.set(base, count + 1);
    return count === 0 ? base : `${base}-${count + 1}`;
  };
}

function validId(value) {
  const id = String(value ?? "").trim();
  return /^[a-z][a-z0-9-]*$/.test(id) ? id : "";
}

function safeInlineText(value) {
  return String(value ?? "")
    .replace(/\r?\n/g, " ")
    .replace(/\s+/g, " ")
    .replace(/@id\(/g, "id(")
    .trim();
}

function slugify(value) {
  const slug = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || "node";
}
