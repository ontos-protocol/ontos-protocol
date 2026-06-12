import { createViewerModel } from "@ontos-protocol/viewer";

const LONG_FIELD_LIMIT = 160;

export function treeWebviewHtml(source, options = {}) {
  const lines = source.split(/\r?\n/u);
  const lineById = nodeLineLookup(lines);
  const model = createViewerModel(source);
  const payload = {
    title: model.title,
    metadata: formatMeta(model.metadata),
    stats: model.stats,
    diagnostics: options.showDiagnostics === false
      ? []
      : (model.diagnostics ?? []).map((diagnostic) => ({
        code: diagnostic.code,
        severity: diagnostic.severity,
        message: diagnostic.message
      })),
    nodes: serializeNodes(model.nodes, lineById, lines)
  };
  const nonce = getNonce();
  const json = escapeForScript(JSON.stringify(payload));

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; script-src 'nonce-${nonce}';">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    :root {
      --bg: var(--vscode-editor-background, #ffffff);
      --fg: var(--vscode-editor-foreground, #1f2937);
      --muted: var(--vscode-descriptionForeground, #64748b);
      --line: var(--vscode-panel-border, #d9dee7);
      --accent: var(--vscode-textLink-foreground, #0b6bcb);
      --hover: var(--vscode-list-hoverBackground, #f4f7fb);
      --selection: var(--vscode-list-activeSelectionBackground, #dbeafe);
      --selection-fg: var(--vscode-list-activeSelectionForeground, var(--fg));
      --input: var(--vscode-input-background, var(--bg));
      --input-border: var(--vscode-input-border, var(--line));
      --warning: var(--vscode-editorWarning-foreground, #b45309);
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      background: var(--bg);
      color: var(--fg);
      font: 13px/1.45 var(--vscode-font-family, system-ui, sans-serif);
    }
    .shell { min-height: 100vh; }
    .topbar {
      display: grid;
      grid-template-columns: minmax(180px, 1fr) minmax(180px, 34%) auto;
      gap: 10px;
      align-items: center;
      padding: 10px 14px;
      border-bottom: 1px solid var(--line);
      position: sticky;
      top: 0;
      background: var(--bg);
      z-index: 2;
    }
    .title {
      margin: 0;
      font-size: 14px;
      font-weight: 700;
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .meta {
      color: var(--muted);
      font-size: 11px;
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .actions { display: flex; gap: 6px; justify-content: flex-end; }
    button, input { font: inherit; }
    button {
      border: 1px solid var(--line);
      background: transparent;
      color: var(--fg);
      border-radius: 4px;
      padding: 4px 8px;
      cursor: pointer;
    }
    button:hover { background: var(--hover); }
    button:focus-visible, input:focus-visible, .node-row:focus-visible {
      outline: 2px solid var(--accent);
      outline-offset: 2px;
    }
    .searchbar {
      display: flex;
      gap: 8px;
      align-items: center;
      padding: 10px 14px;
      border-bottom: 1px solid var(--line);
      background: var(--bg);
      position: sticky;
      top: 43px;
      z-index: 1;
    }
    .search {
      width: 100%;
      min-width: 140px;
      border: 1px solid var(--input-border);
      border-radius: 4px;
      background: var(--input);
      color: var(--fg);
      padding: 5px 8px;
    }
    .count { color: var(--muted); font-size: 11px; white-space: nowrap; }
    .diagnostics {
      margin: 10px 14px 0;
      border: 1px solid var(--warning);
      color: var(--warning);
      border-radius: 4px;
      padding: 8px 10px;
      font-size: 12px;
    }
    .tree { padding: 10px 14px 24px; }
    .node { margin: 1px 0; }
    .node[hidden] { display: none; }
    .node-row {
      --depth: 0;
      display: grid;
      grid-template-columns: calc(var(--depth) * 18px) 20px minmax(0, 1fr) auto;
      align-items: center;
      column-gap: 6px;
      min-height: 30px;
      padding: 2px 6px;
      border-radius: 4px;
      cursor: default;
      user-select: none;
    }
    .node-row:hover { background: var(--hover); }
    .node-row[data-focused="true"] {
      background: var(--selection);
      color: var(--selection-fg);
    }
    .node-row[data-search-hit="true"] .node-title {
      color: var(--accent);
      text-decoration: underline;
      text-underline-offset: 2px;
    }
    .indent-rail {
      align-self: stretch;
      border-right: 1px solid color-mix(in srgb, var(--line), transparent 35%);
      opacity: 0.9;
    }
    .toggle {
      width: 20px;
      min-width: 20px;
      height: 22px;
      padding: 0;
      border: 0;
      color: var(--muted);
      background: transparent;
      text-align: center;
      line-height: 20px;
    }
    .toggle:hover { background: var(--hover); }
    .toggle-spacer {
      display: inline-block;
      width: 20px;
      color: var(--muted);
      text-align: center;
    }
    .node-main { min-width: 0; display: flex; align-items: center; gap: 6px; }
    .node-title {
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      font-weight: 650;
    }
    .chips { display: flex; gap: 4px; flex: 0 1 auto; min-width: 0; overflow: hidden; }
    .chip {
      border: 1px solid var(--line);
      border-radius: 4px;
      color: var(--muted);
      font-size: 11px;
      line-height: 1.2;
      max-width: 160px;
      overflow: hidden;
      padding: 1px 5px;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .chip--status { color: var(--accent); border-color: color-mix(in srgb, var(--accent), transparent 45%); }
    .node-meta {
      color: var(--muted);
      font-size: 11px;
      white-space: nowrap;
    }
    .open-text {
      border: 0;
      color: var(--accent);
      opacity: 0;
      padding: 2px 4px;
    }
    .node-row:hover .open-text, .node-row:focus-within .open-text { opacity: 1; }
    .children { margin-left: 0; }
    .children[hidden] { display: none; }
    .fields {
      --field-indent: 40px;
      margin: 2px 0 7px var(--field-indent);
      display: grid;
      gap: 3px;
    }
    .field-row {
      border-left: 2px solid color-mix(in srgb, var(--line), transparent 25%);
      color: var(--muted);
      padding: 2px 0 2px 8px;
    }
    .field-head {
      display: grid;
      grid-template-columns: minmax(68px, max-content) minmax(0, 1fr);
      gap: 8px;
      align-items: start;
    }
    .field-key { color: var(--fg); font-size: 11px; font-weight: 650; }
    .field-preview {
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .field-full {
      margin: 4px 0 0;
      white-space: pre-wrap;
      overflow-wrap: anywhere;
      color: var(--fg);
    }
    .field-toggle {
      border: 0;
      color: var(--accent);
      font-size: 11px;
      padding: 0 0 0 4px;
    }
    .empty {
      padding: 24px 18px;
      color: var(--muted);
    }
    @media (max-width: 620px) {
      .topbar { grid-template-columns: 1fr; }
      .meta { white-space: normal; }
      .actions { justify-content: flex-start; flex-wrap: wrap; }
      .searchbar { top: 104px; }
      .node-meta { display: none; }
    }
  </style>
</head>
<body>
  <section class="shell">
    <div class="topbar">
      <h1 class="title" id="title"></h1>
      <span class="meta" id="meta"></span>
      <div class="actions">
        <button type="button" id="expand">Expand</button>
        <button type="button" id="collapse">Collapse</button>
        <button type="button" id="openText">Open as Text</button>
      </div>
    </div>
    <div class="searchbar">
      <input class="search" type="search" id="search" placeholder="Search nodes and fields" aria-label="Search nodes and fields">
      <span class="count" id="count"></span>
    </div>
    <div class="diagnostics" id="diagnostics" hidden></div>
    <div class="tree" id="tree" role="tree"></div>
  </section>
  <script nonce="${nonce}">window.__ONTOS__ = ${json};</script>
  <script nonce="${nonce}">
    const vscode = acquireVsCodeApi();
    const data = window.__ONTOS__;
    const tree = document.getElementById("tree");
    const records = new Map();
    document.getElementById("title").textContent = data.title || "Untitled";
    document.getElementById("meta").textContent =
      [data.metadata, data.stats?.nodes ? data.stats.nodes + " nodes" : "", data.stats?.fields ? data.stats.fields + " fields" : ""].filter(Boolean).join(" · ");
    document.getElementById("count").textContent = (data.stats?.nodes || 0) + " nodes";

    if ((data.diagnostics || []).length) {
      const diagnostics = document.getElementById("diagnostics");
      diagnostics.hidden = false;
      diagnostics.textContent = data.diagnostics.map((item) => item.code + ": " + item.message).join(" | ");
    }

    function renderNode(node, parentKey) {
      const hasChildren = (node.children || []).length > 0;
      const hasFields = (node.fields || []).length > 0;
      const expandable = hasChildren || hasFields;
      const wrapper = document.createElement("div");
      wrapper.className = "node";
      wrapper.dataset.key = node.key;
      wrapper.dataset.depth = String(node.depth || 0);

      const row = document.createElement("div");
      row.className = "node-row";
      row.style.setProperty("--depth", String(node.depth || 0));
      row.dataset.line = String(node.line);
      row.dataset.key = node.key;
      if (node.id) row.dataset.nodeId = node.id;
      row.setAttribute("role", "treeitem");
      row.setAttribute("aria-level", String((node.depth || 0) + 1));
      if (expandable) row.setAttribute("aria-expanded", "false");
      row.tabIndex = 0;

      const rail = document.createElement("span");
      rail.className = "indent-rail";
      rail.setAttribute("aria-hidden", "true");
      const toggle = expandable ? document.createElement("button") : document.createElement("span");
      toggle.className = expandable ? "toggle" : "toggle-spacer";
      toggle.textContent = expandable ? "▸" : "·";
      toggle.setAttribute("aria-hidden", expandable ? "false" : "true");
      if (expandable) {
        toggle.type = "button";
        toggle.title = "Expand or collapse node";
        toggle.setAttribute("aria-label", "Expand or collapse node");
      }

      const main = document.createElement("div");
      main.className = "node-main";
      const title = document.createElement("span");
      title.className = "node-title";
      title.textContent = node.title || "Untitled node";
      main.appendChild(title);
      const chips = document.createElement("span");
      chips.className = "chips";
      if (node.status) chips.appendChild(chip("status: " + node.status, "chip--status"));
      for (const tag of node.tags || []) chips.appendChild(chip("#" + tag));
      main.appendChild(chips);

      const meta = document.createElement("span");
      meta.className = "node-meta";
      const metaParts = [];
      if (node.fieldCount) metaParts.push(node.fieldCount + " fields");
      if (node.childCount) metaParts.push(node.childCount + " children");
      meta.textContent = metaParts.join(" · ");

      const openText = document.createElement("button");
      openText.type = "button";
      openText.className = "open-text";
      openText.textContent = "Text";
      openText.title = "Open this node in text mode";

      const right = document.createElement("span");
      right.className = "node-actions";
      right.append(meta, openText);
      row.append(rail, toggle, main, right);
      wrapper.appendChild(row);

      const children = document.createElement("div");
      children.className = "children";
      if (hasFields) {
        const fields = document.createElement("div");
        fields.className = "fields";
        fields.style.setProperty("--field-indent", ((node.depth || 0) * 18 + 42) + "px");
        for (const field of node.fields || []) fields.appendChild(renderField(field));
        children.appendChild(fields);
      }
      for (const child of node.children || []) children.appendChild(renderNode(child, node.key));
      wrapper.appendChild(children);

      const record = {
        node,
        wrapper,
        row,
        toggle,
        children,
        parentKey,
        childKeys: [],
        expandable,
        open: false,
        searchText: (node.searchText || "").toLowerCase()
      };
      records.set(node.key, record);
      if (parentKey && records.has(parentKey)) records.get(parentKey).childKeys.push(node.key);

      setNodeOpen(node.key, node.depth === 0);
      if (expandable) {
        toggle.addEventListener("click", (event) => {
          event.preventDefault();
          event.stopPropagation();
          setNodeOpen(node.key, !record.open);
        });
      }
      row.addEventListener("click", () => selectRow(row, true));
      row.addEventListener("keydown", (event) => {
        if (event.key === "ArrowRight" && expandable) {
          event.preventDefault();
          setNodeOpen(node.key, true);
        } else if (event.key === "ArrowLeft" && expandable) {
          event.preventDefault();
          setNodeOpen(node.key, false);
        } else if (event.key === "Enter") {
          event.preventDefault();
          selectRow(row, true);
        }
      });
      row.addEventListener("dblclick", () => {
        selectRow(row, true);
        vscode.postMessage({ type: "reveal", line: node.line });
      });
      openText.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        selectRow(row, true);
        vscode.postMessage({ type: "reveal", line: node.line });
      });
      return wrapper;
    }

    function renderField(field) {
      const wrapper = document.createElement("div");
      wrapper.className = "field-row";
      if (field.long) wrapper.dataset.long = "true";
      const head = document.createElement("div");
      head.className = "field-head";
      const key = document.createElement("span");
      key.className = "field-key";
      key.textContent = field.key;
      const preview = document.createElement("span");
      preview.className = "field-preview";
      preview.textContent = field.preview;
      head.append(key, preview);
      wrapper.appendChild(head);
      if (field.long) {
        const full = document.createElement("div");
        full.className = "field-full";
        full.hidden = true;
        full.textContent = field.text;
        const button = document.createElement("button");
        button.type = "button";
        button.className = "field-toggle";
        button.textContent = "Show full field";
        button.setAttribute("aria-expanded", "false");
        button.addEventListener("click", () => {
          const expanded = full.hidden;
          full.hidden = !expanded;
          button.textContent = expanded ? "Hide full field" : "Show full field";
          button.setAttribute("aria-expanded", String(expanded));
        });
        preview.appendChild(button);
        wrapper.appendChild(full);
      }
      return wrapper;
    }

    function chip(text, extraClass) {
      const element = document.createElement("span");
      element.className = ["chip", extraClass].filter(Boolean).join(" ");
      element.textContent = text;
      return element;
    }

    function setNodeOpen(key, value) {
      const record = records.get(key);
      if (!record || !record.expandable) return;
      record.open = Boolean(value);
      record.children.hidden = !record.open;
      record.row.setAttribute("aria-expanded", String(record.open));
      record.toggle.textContent = record.open ? "▾" : "▸";
    }

    function selectRow(row, shouldScroll) {
      tree.querySelectorAll(".node-row[data-focused='true']").forEach((item) => {
        delete item.dataset.focused;
      });
      row.dataset.focused = "true";
      openAncestors(row.dataset.key);
      if (shouldScroll) row.scrollIntoView({ block: "center" });
      row.focus();
      vscode.postMessage({ type: "focus", line: Number(row.dataset.line), nodeId: row.dataset.nodeId });
    }

    function openAncestors(key) {
      let current = records.get(key);
      while (current?.parentKey) {
        setNodeOpen(current.parentKey, true);
        current = records.get(current.parentKey);
      }
    }

    function descendantsOf(key, output = new Set()) {
      const record = records.get(key);
      for (const childKey of record?.childKeys || []) {
        output.add(childKey);
        descendantsOf(childKey, output);
      }
      return output;
    }

    function applySearch() {
      const query = document.getElementById("search").value.trim().toLowerCase();
      tree.querySelectorAll(".node-row[data-search-hit='true']").forEach((row) => {
        delete row.dataset.searchHit;
      });
      if (!query) {
        for (const record of records.values()) record.wrapper.hidden = false;
        document.getElementById("count").textContent = (data.stats?.nodes || 0) + " nodes";
        return;
      }
      const visible = new Set();
      const hits = [];
      for (const record of records.values()) {
        if (record.searchText.includes(query)) {
          hits.push(record);
          visible.add(record.node.key);
          for (const childKey of descendantsOf(record.node.key)) visible.add(childKey);
          let current = record;
          while (current?.parentKey) {
            visible.add(current.parentKey);
            setNodeOpen(current.parentKey, true);
            current = records.get(current.parentKey);
          }
          record.row.dataset.searchHit = "true";
        }
      }
      for (const record of records.values()) record.wrapper.hidden = !visible.has(record.node.key);
      document.getElementById("count").textContent = hits.length + " matches";
    }

    window.addEventListener("message", (event) => {
      if (event.data?.type !== "focusNode") return;
      const row = tree.querySelector(".node-row[data-line='" + String(event.data.line) + "']");
      if (row) selectRow(row, true);
    });

    if (!data.nodes || data.nodes.length === 0) {
      const empty = document.createElement("div");
      empty.className = "empty";
      empty.textContent = "No nodes found.";
      tree.appendChild(empty);
    } else {
      for (const node of data.nodes) tree.appendChild(renderNode(node, undefined));
    }

    document.getElementById("expand").addEventListener("click", () => {
      for (const record of records.values()) setNodeOpen(record.node.key, true);
    });
    document.getElementById("collapse").addEventListener("click", () => {
      for (const record of records.values()) setNodeOpen(record.node.key, false);
    });
    document.getElementById("openText").addEventListener("click", () => {
      vscode.postMessage({ type: "openText" });
    });
    document.getElementById("search").addEventListener("input", applySearch);
  </script>
</body>
</html>`;
}

function serializeNodes(nodes, lineById, lines, depth = 0, path = []) {
  return (nodes ?? []).map((node, index) => {
    const nodePath = [...path, index];
    const line = node.id
      ? lineById.get(node.id) ?? findTitleLine(lines, node.title)
      : findTitleLine(lines, node.title);
    const fields = Object.entries(node.fields ?? {}).map(([key, value]) => formatField(key, value));
    const children = serializeNodes(node.children, lineById, lines, depth + 1, nodePath);
    const status = fields.find((field) => field.key === "status")?.text;
    const searchText = [
      node.title,
      node.id,
      ...(node.tags ?? []),
      ...fields.flatMap((field) => [field.key, field.text])
    ].filter(Boolean).join(" ");
    return {
      key: node.id ? `id:${node.id}` : `line:${line}:${nodePath.join(".")}`,
      title: node.title,
      id: node.id,
      tags: node.tags ?? [],
      fields,
      status,
      fieldCount: fields.length,
      childCount: children.length,
      line,
      depth,
      children,
      searchText
    };
  });
}

function formatField(key, value) {
  const text = fieldText(value);
  const normalized = text.replace(/\s+/gu, " ").trim();
  const long = text.length > LONG_FIELD_LIMIT || text.includes("\n");
  return {
    key,
    text,
    preview: long ? `${normalized.slice(0, LONG_FIELD_LIMIT).trimEnd()}...` : normalized,
    long
  };
}

function fieldText(value) {
  if (Array.isArray(value)) {
    return value.map((item) => fieldText(item)).join("\n");
  }
  if (value && typeof value === "object" && "value" in value) {
    return fieldText(value.value);
  }
  if (value && typeof value === "object") {
    return JSON.stringify(value);
  }
  return String(value ?? "");
}

function formatMeta(metadata = {}) {
  return Object.entries(metadata)
    .filter(([key]) => key !== "title")
    .map(([key, value]) => `@${key} ${value}`)
    .join(" · ");
}

function nodeLineLookup(lines) {
  const map = new Map();
  for (const [index, line] of lines.entries()) {
    const id = line.match(/@id\(([^)]+)\)/u)?.[1];
    if (id) {
      map.set(id, index);
    }
  }
  return map;
}

function findTitleLine(lines, title) {
  const index = lines.findIndex((line) => line.includes(title));
  return Math.max(index, 0);
}

function escapeForScript(json) {
  return json
    .replace(/</gu, "\\u003c")
    .replace(/>/gu, "\\u003e")
    .replace(/\u2028/gu, "\\u2028")
    .replace(/\u2029/gu, "\\u2029");
}

function getNonce() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let text = "";
  for (let index = 0; index < 32; index += 1) {
    text += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return text;
}
