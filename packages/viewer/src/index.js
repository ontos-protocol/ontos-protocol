import {
  collectReferences,
  getNodeText,
  parseOntosDocument,
  walkNodes
} from "@ontos-protocol/parser";

const EXPORT_TARGETS = ["md", "html", "json", "opml"];

export function createViewerModel(source) {
  const ast = typeof source === "string" ? parseOntosDocument(source) : source;
  const references = collectReferences(ast);
  const flatNodes = [];
  const nodes = (ast.nodes ?? []).map((node) =>
    modelNode(ast, node, [], 0, undefined, references, flatNodes)
  );
  const fieldNames = new Set();
  walkNodes(ast, (node) => {
    for (const key of Object.keys(node.fields ?? {})) {
      fieldNames.add(key);
    }
  });

  return {
    ast,
    title: ast.metadata?.title ?? "Untitled",
    metadata: ast.metadata ?? {},
    diagnostics: ast.diagnostics ?? [],
    references,
    nodes,
    flatNodes,
    stats: {
      nodes: flatNodes.length,
      fields: fieldNames.size,
      references: references.length
    }
  };
}

export function searchViewerModel(model, query) {
  const normalized = query.trim().toLowerCase();
  if (!normalized) {
    return model.flatNodes;
  }
  return model.flatNodes.filter((node) => searchableText(node).includes(normalized));
}

export function exportViewerDocument(sourceOrModel, target) {
  const model = isViewerModel(sourceOrModel) ? sourceOrModel : createViewerModel(sourceOrModel);
  switch (target) {
    case "json":
      return `${JSON.stringify(model.ast, null, 2)}\n`;
    case "md":
      return exportMarkdown(model);
    case "html":
      return exportHtml(model);
    case "opml":
      return exportOpml(model);
    default:
      throw new Error(`Unsupported viewer export target: ${target}`);
  }
}

export function createOntosViewer(source, options = {}) {
  const doc = options.document ?? globalThis.document;
  if (!doc) {
    throw new Error("createOntosViewer requires a DOM Document.");
  }
  const root = doc.createElement("section");
  root.className = "ontos-viewer";
  root.appendChild(styles(doc));

  if (source === undefined || source === null || source === "") {
    root.appendChild(emptyState(doc));
    return root;
  }

  let model;
  try {
    model = createViewerModel(source);
  } catch (error) {
    root.appendChild(errorState(doc, error));
    return root;
  }

  root.__ontosModel = model;
  root.appendChild(header(doc, model));
  if (options.showToolbar !== false) {
    root.appendChild(toolbar(doc, root, model));
  }
  if (model.diagnostics.length > 0) {
    root.appendChild(diagnosticsPanel(doc, model.diagnostics));
  }
  const tree = doc.createElement("div");
  tree.className = "ontos-viewer__tree";
  tree.setAttribute("role", "tree");
  for (const node of model.nodes) {
    tree.appendChild(nodeDetails(doc, root, node));
  }
  attachTreeKeyboard(tree);
  root.appendChild(tree);
  return root;
}

export function createOntosViewerApp(options = {}) {
  const doc = options.document ?? globalThis.document;
  if (!doc) {
    throw new Error("createOntosViewerApp requires a DOM Document.");
  }
  const app = doc.createElement("section");
  app.className = "ontos-viewer-app";
  app.appendChild(styles(doc));

  const status = doc.createElement("p");
  status.className = "ontos-viewer-app__status";
  status.setAttribute("role", "status");
  status.textContent = "Local file stays in this browser.";

  const controls = doc.createElement("div");
  controls.className = "ontos-viewer-app__controls";
  const fileInput = doc.createElement("input");
  fileInput.type = "file";
  fileInput.accept = ".ontos,text/plain";
  fileInput.setAttribute("aria-label", "Open local .ontos file");
  controls.append(fileInput, status);

  const mount = doc.createElement("div");
  mount.className = "ontos-viewer-app__mount";
  mount.appendChild(createOntosViewer(options.initialSource ?? null, { document: doc }));
  app.append(controls, mount);

  const loadFile = async (file) => {
    if (!file) {
      return;
    }
    status.textContent = "Loading local file.";
    try {
      const text = await file.text();
      mount.replaceChildren(createOntosViewer(text, { document: doc }));
      status.textContent = `${file.name} loaded.`;
    } catch (error) {
      mount.replaceChildren(errorState(doc, error));
      status.textContent = "Could not load file.";
    }
  };

  fileInput.addEventListener("change", () => {
    loadFile(fileInput.files?.[0]);
  });
  app.addEventListener("dragover", (event) => {
    event.preventDefault();
    app.dataset.dragging = "true";
  });
  app.addEventListener("dragleave", () => {
    delete app.dataset.dragging;
  });
  app.addEventListener("drop", (event) => {
    event.preventDefault();
    delete app.dataset.dragging;
    loadFile(event.dataTransfer?.files?.[0]);
  });

  return app;
}

export function renderOntosViewer(target, source, options = {}) {
  const viewer = createOntosViewer(source, options);
  target.replaceChildren(viewer);
  return viewer.__ontosModel;
}

export function focusViewerNode(root, nodeId) {
  root.querySelectorAll("[data-focused='true']").forEach((element) => {
    delete element.dataset.focused;
  });
  const node = root.querySelector(`[data-node-id="${cssEscape(nodeId)}"]`);
  if (!node) {
    return false;
  }
  node.dataset.focused = "true";
  for (let current = node; current; current = current.parentElement?.closest?.("details")) {
    if (current.tagName?.toLowerCase() === "details") {
      current.open = true;
    }
  }
  node.setAttribute("tabindex", "-1");
  node.focus?.();
  return true;
}

export function defineOntosViewerElement(name = "ontos-viewer") {
  const registry = globalThis.customElements;
  const Base = globalThis.HTMLElement;
  if (!registry || !Base) {
    throw new Error("defineOntosViewerElement requires Custom Elements support.");
  }
  const existing = registry.get(name);
  if (existing) {
    return existing;
  }

  class OntosViewerElement extends Base {
    async connectedCallback() {
      if (this.shadowRoot) {
        return;
      }
      const shadow = this.attachShadow({ mode: "open" });
      const src = this.getAttribute("src");
      const text = src ? await fetch(src).then((response) => response.text()) : this.textContent;
      shadow.appendChild(createOntosViewerApp({ document: this.ownerDocument, initialSource: text }));
    }
  }

  registry.define(name, OntosViewerElement);
  return OntosViewerElement;
}

function modelNode(ast, node, ancestors, depth, parentId, references, flatNodes) {
  const path = [...ancestors, node.title];
  const current = {
    id: node.id,
    parentId,
    title: node.title,
    tags: node.tags ?? [],
    fields: node.fields ?? {},
    references: references.filter((reference) => reference.nodeId === node.id),
    path,
    depth,
    text: node.id ? getNodeText(ast, node.id) : node.title,
    children: []
  };
  flatNodes.push(current);
  current.children = (node.children ?? []).map((child) =>
    modelNode(ast, child, path, depth + 1, node.id, references, flatNodes)
  );
  return current;
}

function header(doc, model) {
  const element = doc.createElement("header");
  element.className = "ontos-viewer__header";
  const title = doc.createElement("h1");
  title.textContent = model.title;
  const stats = doc.createElement("p");
  stats.textContent = `${model.stats.nodes} nodes | ${model.stats.fields} fields | ${model.stats.references} references`;
  element.append(title, stats);
  return element;
}

function toolbar(doc, root, model) {
  const element = doc.createElement("div");
  element.className = "ontos-viewer__toolbar";
  const search = doc.createElement("input");
  search.type = "search";
  search.placeholder = "Search nodes, fields, references";
  search.setAttribute("aria-label", "Search nodes, fields, and references");
  const expand = button(doc, "Expand all", () => {
    root.querySelectorAll("details").forEach((details) => {
      details.open = true;
    });
  });
  const collapse = button(doc, "Collapse all", () => {
    root.querySelectorAll("details").forEach((details) => {
      details.open = false;
    });
  });
  search.addEventListener("input", () => applySearch(root, model, search.value));
  element.append(search, expand, collapse);
  for (const target of EXPORT_TARGETS) {
    element.appendChild(exportButton(doc, root, model, target));
  }
  return element;
}

function exportButton(doc, root, model, target) {
  const element = button(doc, `Export ${target.toUpperCase()}`, () => {
    const content = exportViewerDocument(model, target);
    dispatch(root, "ontos-export", {
      target,
      filename: `${slugify(model.title)}.${target === "md" ? "md" : target}`,
      content
    });
  });
  element.dataset.exportTarget = target;
  element.setAttribute("aria-label", `Export ${target.toUpperCase()}`);
  return element;
}

function nodeDetails(doc, root, node) {
  const details = doc.createElement("details");
  details.open = true;
  details.className = "ontos-viewer__node";
  details.dataset.nodeId = node.id ?? "";
  details.dataset.parentId = node.parentId ?? "";
  details.dataset.depth = String(node.depth);
  details.setAttribute("role", "treeitem");
  syncExpandedState(details);
  details.addEventListener("toggle", () => syncExpandedState(details));

  const summary = doc.createElement("summary");
  summary.textContent = node.id ? `${node.title} #${node.id}` : node.title;
  summary.tabIndex = 0;
  summary.dataset.nodeSummary = node.id ?? "";
  details.appendChild(summary);

  const actions = doc.createElement("div");
  actions.className = "ontos-viewer__actions";
  actions.append(
    copyButton(doc, root, "Copy text", "copy-text", node.text, node),
    copyButton(doc, root, "Copy ID", "copy-id", node.id ?? "", node),
    copyButton(doc, root, "Copy path", "copy-path", node.path.join(" > "), node)
  );
  if (node.fields.ai_boundary) {
    actions.appendChild(copyButton(doc, root, "Copy AI boundary", "copy-ai-boundary", fieldValueText(node.fields.ai_boundary), node));
  }
  const focus = button(doc, "Focus", () => {
    focusViewerNode(root, node.id);
  });
  focus.dataset.action = "focus";
  focus.dataset.nodeId = node.id ?? "";
  actions.appendChild(focus);
  details.appendChild(actions);

  if (node.tags.length > 0) {
    const tags = doc.createElement("p");
    tags.className = "ontos-viewer__tags";
    tags.textContent = node.tags.map((tag) => `#${tag}`).join(" ");
    details.appendChild(tags);
  }

  for (const [key, value] of Object.entries(node.fields)) {
    const field = doc.createElement("section");
    field.className = "ontos-viewer__field";
    field.dataset.field = key;
    const title = doc.createElement("h2");
    title.textContent = key;
    const body = doc.createElement(Array.isArray(value) ? "ul" : "p");
    if (Array.isArray(value)) {
      for (const item of value) {
        const li = doc.createElement("li");
        li.textContent = String(item ?? "");
        body.appendChild(li);
      }
    } else {
      body.textContent = fieldValueText(value);
    }
    field.append(title, body);
    details.appendChild(field);
  }

  if (node.references.length > 0) {
    details.appendChild(referencesPanel(doc, node.references));
  }

  for (const child of node.children) {
    details.appendChild(nodeDetails(doc, root, child));
  }
  return details;
}

function attachTreeKeyboard(tree) {
  tree.addEventListener("keydown", (event) => {
    const summary = event.target?.closest?.("summary");
    if (!summary || !tree.contains(summary)) {
      return;
    }

    const details = summary.closest("details");
    const summaries = visibleSummaries(tree);
    const index = summaries.indexOf(summary);
    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        focusSummary(summaries[index + 1] ?? summaries[0]);
        break;
      case "ArrowUp":
        event.preventDefault();
        focusSummary(summaries[index - 1] ?? summaries.at(-1));
        break;
      case "Home":
        event.preventDefault();
        focusSummary(summaries[0]);
        break;
      case "End":
        event.preventDefault();
        focusSummary(summaries.at(-1));
        break;
      case "ArrowRight":
        event.preventDefault();
        if (details && !details.open) {
          details.open = true;
          syncExpandedState(details);
        } else {
          focusSummary(details?.querySelector(":scope > details > summary"));
        }
        break;
      case "ArrowLeft":
        event.preventDefault();
        if (details?.open) {
          details.open = false;
          syncExpandedState(details);
        } else {
          focusSummary(details?.parentElement?.closest("details")?.querySelector(":scope > summary"));
        }
        break;
      default:
        break;
    }
  });
}

function visibleSummaries(tree) {
  return [...tree.querySelectorAll("summary")].filter((summary) => {
    const hiddenAncestor = summary.closest("details[hidden]");
    return !hiddenAncestor;
  });
}

function focusSummary(summary) {
  summary?.focus?.();
}

function syncExpandedState(details) {
  details.setAttribute("aria-expanded", details.open ? "true" : "false");
}

function referencesPanel(doc, references) {
  const section = doc.createElement("section");
  section.className = "ontos-viewer__references";
  const title = doc.createElement("h2");
  title.textContent = "references";
  const list = doc.createElement("ul");
  for (const reference of references) {
    const item = doc.createElement("li");
    item.textContent = `${reference.kind}: ${reference.target}`;
    list.appendChild(item);
  }
  section.append(title, list);
  return section;
}

function diagnosticsPanel(doc, diagnostics) {
  const section = doc.createElement("section");
  section.className = "ontos-viewer__diagnostics";
  section.setAttribute("role", "alert");
  const title = doc.createElement("h2");
  title.textContent = "Diagnostics";
  const list = doc.createElement("ul");
  for (const diagnostic of diagnostics) {
    const item = doc.createElement("li");
    item.textContent = `${diagnostic.severity} ${diagnostic.code}: ${diagnostic.message}`;
    list.appendChild(item);
  }
  section.append(title, list);
  return section;
}

function emptyState(doc) {
  const section = doc.createElement("section");
  section.className = "ontos-viewer__empty";
  section.textContent = "Open a local .ontos file to inspect its nodes.";
  return section;
}

function errorState(doc, error) {
  const section = doc.createElement("section");
  section.className = "ontos-viewer__error";
  section.setAttribute("role", "alert");
  section.textContent = `Could not render .ontos document: ${error.message}`;
  return section;
}

function applySearch(root, model, query) {
  const matched = new Set(searchViewerModel(model, query).map((node) => node.id).filter(Boolean));
  const visible = new Set(matched);
  for (const node of model.flatNodes) {
    if (!node.id || !matched.has(node.id)) {
      continue;
    }
    let current = node;
    while (current?.parentId) {
      visible.add(current.parentId);
      current = model.flatNodes.find((candidate) => candidate.id === current.parentId);
    }
  }

  root.querySelectorAll("[data-node-id]").forEach((element) => {
    const id = element.dataset.nodeId;
    const shouldHide = query.trim() !== "" && id && !visible.has(id);
    element.hidden = Boolean(shouldHide);
    if (!shouldHide && query.trim() !== "") {
      element.open = true;
    }
  });
}

function copyButton(doc, root, label, action, text, node) {
  const element = button(doc, label, async () => {
    await writeClipboard(doc, text);
    dispatch(root, "ontos-copy", {
      action,
      nodeId: node.id,
      text
    });
  });
  element.dataset.action = action;
  element.dataset.nodeId = node.id ?? "";
  element.disabled = text === "";
  return element;
}

async function writeClipboard(doc, text) {
  const clipboard = doc.defaultView?.navigator?.clipboard ?? globalThis.navigator?.clipboard;
  if (clipboard?.writeText) {
    await clipboard.writeText(text);
  }
}

function dispatch(root, name, detail) {
  const EventCtor = root.ownerDocument.defaultView?.CustomEvent ?? globalThis.CustomEvent;
  root.dispatchEvent(new EventCtor(name, { bubbles: true, detail }));
}

function button(doc, label, onClick) {
  const element = doc.createElement("button");
  element.type = "button";
  element.textContent = label;
  element.addEventListener("click", onClick);
  return element;
}

function styles(doc) {
  const style = doc.createElement("style");
  style.textContent = `
    .ontos-viewer, .ontos-viewer-app { color: #18202a; font: 14px/1.5 system-ui, sans-serif; }
    .ontos-viewer__header { border-bottom: 1px solid #d9dee7; margin-bottom: 12px; padding-bottom: 8px; }
    .ontos-viewer__header h1 { font-size: 20px; margin: 0 0 4px; }
    .ontos-viewer__header p, .ontos-viewer-app__status { color: #536071; margin: 0; }
    .ontos-viewer-app__controls, .ontos-viewer__toolbar, .ontos-viewer__actions { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 12px; }
    .ontos-viewer__toolbar input { border: 1px solid #bcc5d3; border-radius: 6px; min-width: 240px; padding: 6px 8px; }
    .ontos-viewer button, .ontos-viewer-app input::file-selector-button { border: 1px solid #aeb8c7; border-radius: 6px; background: #fff; padding: 6px 10px; }
    .ontos-viewer :is(button, input, summary):focus-visible, .ontos-viewer-app :is(button, input):focus-visible { outline: 2px solid #0b6bcb; outline-offset: 2px; }
    .ontos-viewer__node { border-left: 1px solid #d9dee7; margin: 6px 0 6px 12px; padding-left: 12px; }
    .ontos-viewer__node[data-focused='true'] { border-left-color: #0b6bcb; outline: 2px solid #9cc7f4; }
    .ontos-viewer__node summary { cursor: pointer; font-weight: 700; }
    .ontos-viewer__field h2, .ontos-viewer__references h2, .ontos-viewer__diagnostics h2 { font-size: 13px; margin: 8px 0 2px; }
    .ontos-viewer__field p, .ontos-viewer__field ul, .ontos-viewer__references ul, .ontos-viewer__diagnostics ul { margin: 0 0 4px; }
    .ontos-viewer__tags { color: #536071; margin: 4px 0; }
    .ontos-viewer__diagnostics, .ontos-viewer__error { border: 1px solid #d28b00; border-radius: 6px; margin: 10px 0; padding: 8px; }
    .ontos-viewer__empty { border: 1px dashed #aeb8c7; border-radius: 6px; padding: 16px; }
    @media (max-width: 640px) { .ontos-viewer__toolbar input { min-width: 100%; } }
    @media (prefers-contrast: more) { .ontos-viewer button, .ontos-viewer__toolbar input { border-color: #18202a; } }
    @media (prefers-reduced-motion: reduce) { .ontos-viewer *, .ontos-viewer-app * { scroll-behavior: auto; transition-duration: 0.001ms; animation-duration: 0.001ms; } }
  `;
  return style;
}

function searchableText(node) {
  return [
    node.title,
    node.id ?? "",
    node.path.join(" "),
    Object.keys(node.fields).join(" "),
    Object.values(node.fields).map(fieldValueText).join(" "),
    node.references.map((reference) => reference.target).join(" ")
  ]
    .join(" ")
    .toLowerCase();
}

function fieldValueText(value) {
  if (Array.isArray(value)) {
    return value.map((item) => String(item ?? "")).join("\n");
  }
  if (value && typeof value === "object" && "value" in value) {
    return String(value.value ?? "");
  }
  return String(value ?? "");
}

function isViewerModel(value) {
  return Boolean(value?.flatNodes && value?.stats && value?.nodes);
}

function exportMarkdown(model) {
  const lines = [`# ${model.title}`, ""];
  for (const node of model.nodes) {
    markdownNode(node, 2, lines);
  }
  return `${lines.join("\n")}\n`;
}

function markdownNode(node, depth, lines) {
  const id = node.id ? ` {#${node.id}}` : "";
  lines.push(`${"#".repeat(depth)} ${node.title}${id}`, "");
  for (const [key, value] of Object.entries(node.fields)) {
    lines.push(`**${key}:**`, "", fieldValueText(value), "");
    if (isRichField(value) && value.kind === "code") {
      lines.splice(lines.length - 2, 1, fencedCode(value));
    }
  }
  for (const child of node.children) {
    markdownNode(child, depth + 1, lines);
  }
}

function exportHtml(model) {
  const body = model.nodes.map((node) => htmlNode(node, 0)).join("\n");
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>${escapeHtml(model.title)}</title>
</head>
<body>
  <h1>${escapeHtml(model.title)}</h1>
${body}
</body>
</html>
`;
}

function htmlNode(node, depth) {
  const pad = "  ".repeat(depth);
  const childPad = "  ".repeat(depth + 1);
  const id = node.id ? ` id="${escapeHtml(node.id)}"` : "";
  const fields = Object.entries(node.fields)
    .map(([key, value]) => `${childPad}<section data-field="${escapeHtml(key)}"><h2>${escapeHtml(key)}</h2>${htmlFieldValue(value)}</section>`)
    .join("\n");
  const children = node.children.map((child) => htmlNode(child, depth + 1)).join("\n");
  return `${pad}<details open${id}>
${childPad}<summary>${escapeHtml(node.title)}</summary>
${[fields, children].filter(Boolean).join("\n")}
${pad}</details>`;
}

function exportOpml(model) {
  const outlines = model.nodes.map((node) => opmlNode(node, 2)).join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>
<opml version="2.0">
  <head>
    <title>${escapeXml(model.title)}</title>
  </head>
  <body>
${outlines}
  </body>
</opml>
`;
}

function opmlNode(node, indent) {
  const pad = " ".repeat(indent);
  const id = node.id ? ` _id="${escapeXml(node.id)}"` : "";
  const children = node.children.map((child) => opmlNode(child, indent + 2)).join("\n");
  if (!children) {
    return `${pad}<outline text="${escapeXml(node.title)}"${id}/>`;
  }
  return `${pad}<outline text="${escapeXml(node.title)}"${id}>
${children}
${pad}</outline>`;
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

function htmlFieldValue(value) {
  if (isRichField(value) && value.kind === "code") {
    const language = value.language ? ` class="language-${escapeHtml(value.language)}"` : "";
    return `<pre><code${language}>${escapeHtml(value.value ?? "")}</code></pre>`;
  }
  return `<p>${escapeHtml(fieldValueText(value))}</p>`;
}

function fencedCode(value) {
  const language = value.language ? String(value.language) : "";
  return `\`\`\`${language}\n${String(value.value ?? "")}\n\`\`\``;
}

function isRichField(value) {
  return Boolean(value && typeof value === "object" && "kind" in value && "value" in value);
}

function slugify(value) {
  const slug = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || "document";
}

function cssEscape(value) {
  if (globalThis.CSS?.escape) {
    return globalThis.CSS.escape(value);
  }
  return String(value).replaceAll('"', '\\"');
}
