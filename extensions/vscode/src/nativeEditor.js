import * as vscode from "vscode";
import { createViewerModel } from "@ontos-protocol/viewer";
import { suppressTreePromotion } from "./openMode.js";

export class OntosNativeEditorProvider {
  constructor(options = {}) {
    this.onFocusNode = options.onFocusNode;
    this.panelsByUri = new Map();
  }

  openCustomDocument(uri) {
    return {
      uri,
      dispose() {}
    };
  }

  async resolveCustomTextEditor(document, webviewPanel) {
    this.panelsByUri.set(document.uri.toString(), webviewPanel);
    const webview = webviewPanel.webview;
    webview.options = {
      enableScripts: true,
      localResourceRoots: []
    };

    const render = () => {
      webview.html = nativeEditorHtml(document.getText(), webview);
    };

    render();

    const changeSubscription = vscode.workspace.onDidChangeTextDocument((event) => {
      if (event.document.uri.toString() === document.uri.toString()) {
        render();
      }
    });

    const messageSubscription = webview.onDidReceiveMessage((message) => {
      if (message?.type === "focus" && typeof message.line === "number") {
        this.onFocusNode?.({
          uri: document.uri,
          line: message.line,
          nodeId: typeof message.nodeId === "string" ? message.nodeId : undefined
        });
        return;
      }
      if (message?.type !== "reveal" || typeof message.line !== "number") {
        return;
      }
      void revealTextLine(document.uri, message.line);
    });

    webviewPanel.onDidDispose(() => {
      this.panelsByUri.delete(document.uri.toString());
      changeSubscription.dispose();
      messageSubscription.dispose();
    });
  }

  focusNode(uri, target) {
    const panel = this.panelsByUri.get(uri.toString());
    if (!panel || typeof target?.line !== "number") {
      return;
    }
    void panel.webview.postMessage({
      type: "focusNode",
      line: target.line,
      nodeId: target.nodeId
    });
  }
}

async function revealTextLine(uri, requestedLine) {
  suppressTreePromotion(uri);
  const document = await vscode.workspace.openTextDocument(uri);
  const editor = await vscode.window.showTextDocument(document, {
    viewColumn: vscode.ViewColumn.Beside,
    preserveFocus: false
  });
  const line = Math.min(Math.max(requestedLine, 0), editor.document.lineCount - 1);
  const position = new vscode.Position(line, 0);
  const range = new vscode.Range(position, position);
  editor.revealRange(range, vscode.TextEditorRevealType.InCenter);
  editor.selection = new vscode.Selection(position, position);
}

function nativeEditorHtml(source) {
  const lines = source.split(/\r?\n/u);
  const lineById = nodeLineLookup(lines);
  const model = createViewerModel(source);
  const payload = {
    title: model.title,
    metadata: formatMeta(model.metadata),
    stats: model.stats,
    diagnostics: (model.diagnostics ?? []).map((diagnostic) => ({
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
      --warning: var(--vscode-editorWarning-foreground, #b45309);
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      background: var(--bg);
      color: var(--fg);
      font: 13px/1.45 var(--vscode-font-family, system-ui, sans-serif);
    }
    .bar {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 12px;
      border-bottom: 1px solid var(--line);
      position: sticky;
      top: 0;
      background: var(--bg);
      z-index: 1;
    }
    .title {
      margin: 0;
      font-size: 13px;
      font-weight: 600;
      flex: 1;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .meta {
      color: var(--muted);
      font-size: 11px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 35%;
    }
    button {
      font: inherit;
      font-size: 11px;
      border: 1px solid var(--line);
      background: transparent;
      color: var(--fg);
      border-radius: 4px;
      padding: 4px 8px;
      cursor: pointer;
    }
    button:hover { background: var(--hover); }
    .diagnostics {
      margin: 10px 12px 0;
      border: 1px solid var(--warning);
      color: var(--warning);
      border-radius: 4px;
      padding: 8px 10px;
      font-size: 12px;
    }
    .tree { padding: 8px 6px 24px; }
    .node { margin: 1px 0; }
    .row {
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 3px 6px;
      border-radius: 4px;
      cursor: pointer;
      user-select: none;
    }
    .row:hover { background: var(--hover); }
    .row[data-focused="true"] {
      background: var(--vscode-list-activeSelectionBackground, #dbeafe);
      color: var(--vscode-list-activeSelectionForeground, var(--fg));
    }
    .chevron {
      width: 14px;
      text-align: center;
      color: var(--muted);
      flex: 0 0 14px;
    }
    .label { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .tag { color: var(--accent); margin-left: 6px; font-size: 11px; }
    .edit {
      font-size: 11px;
      color: var(--accent);
      opacity: 0;
      flex: 0 0 auto;
    }
    .row:hover .edit, .row:focus-within .edit { opacity: 1; }
    .children { margin-left: 14px; border-left: 1px solid var(--line); }
    .children[hidden] { display: none; }
    .fields {
      margin: 2px 0 6px 28px;
      color: var(--muted);
      font-size: 12px;
    }
    .field { margin: 2px 0; overflow-wrap: anywhere; }
    .empty {
      padding: 24px 18px;
      color: var(--muted);
    }
  </style>
</head>
<body>
  <div class="bar">
    <h1 class="title" id="title"></h1>
    <span class="meta" id="meta"></span>
    <button type="button" id="expand">Expand</button>
    <button type="button" id="collapse">Collapse</button>
  </div>
  <div class="diagnostics" id="diagnostics" hidden></div>
  <div class="tree" id="tree" role="tree"></div>
  <script nonce="${nonce}">window.__ONTOS__ = ${json};</script>
  <script nonce="${nonce}">
    const vscode = acquireVsCodeApi();
    const data = window.__ONTOS__;
    const tree = document.getElementById("tree");
    document.getElementById("title").textContent = data.title || "Untitled";
    document.getElementById("meta").textContent =
      [data.metadata, data.stats?.nodes ? data.stats.nodes + " nodes" : ""].filter(Boolean).join(" · ");

    if ((data.diagnostics || []).length) {
      const diagnostics = document.getElementById("diagnostics");
      diagnostics.hidden = false;
      diagnostics.textContent = data.diagnostics.map((item) => item.code + ": " + item.message).join(" | ");
    }

    function textValue(value) {
      if (Array.isArray(value)) return value.join(" · ");
      if (value && typeof value === "object" && "value" in value) return textValue(value.value);
      return String(value ?? "");
    }

    function renderNode(node) {
      const hasChildren = (node.children || []).length > 0;
      const hasFields = Object.keys(node.fields || {}).length > 0;
      const expandable = hasChildren || hasFields;
      const wrapper = document.createElement("div");
      wrapper.className = "node";

      const row = document.createElement("div");
      row.className = "row";
      row.style.paddingLeft = (node.depth * 12 + 6) + "px";
      row.dataset.line = String(node.line);
      if (node.id) row.dataset.nodeId = node.id;
      row.setAttribute("role", "treeitem");
      row.setAttribute("aria-expanded", expandable ? "true" : "false");
      row.tabIndex = 0;

      const chevron = document.createElement("span");
      chevron.className = "chevron";
      const label = document.createElement("span");
      label.className = "label";
      label.textContent = node.title;
      for (const tag of node.tags || []) {
        const span = document.createElement("span");
        span.className = "tag";
        span.textContent = "#" + tag;
        label.appendChild(span);
      }
      const edit = document.createElement("button");
      edit.type = "button";
      edit.className = "edit";
      edit.textContent = "Edit";
      edit.title = "Open this node in text mode";
      row.append(chevron, label, edit);
      wrapper.appendChild(row);

      const children = document.createElement("div");
      children.className = "children";
      if (hasFields) {
        const fields = document.createElement("div");
        fields.className = "fields";
        for (const [key, value] of Object.entries(node.fields || {})) {
          const field = document.createElement("div");
          field.className = "field";
          field.textContent = key + ": " + textValue(value);
          fields.appendChild(field);
        }
        children.appendChild(fields);
      }
      for (const child of node.children || []) {
        children.appendChild(renderNode(child));
      }
      wrapper.appendChild(children);

      let open = node.depth < 1;
      const setOpen = (value) => {
        open = Boolean(value);
        children.hidden = !open;
        row.setAttribute("aria-expanded", expandable ? String(open) : "false");
        chevron.textContent = expandable ? (open ? "▾" : "▸") : "·";
      };
      setOpen(open);

      const toggle = () => {
        if (expandable) setOpen(!open);
      };
      const focusCurrent = () => {
        markFocusedRow(row, true);
        vscode.postMessage({ type: "focus", line: node.line, nodeId: node.id });
      };
      row.addEventListener("click", (event) => {
        focusCurrent();
        if (event.target === edit) return;
        toggle();
      });
      row.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          focusCurrent();
          toggle();
        }
      });
      row.addEventListener("dblclick", () => {
        focusCurrent();
        vscode.postMessage({ type: "reveal", line: node.line });
      });
      edit.addEventListener("click", (event) => {
        event.stopPropagation();
        focusCurrent();
        vscode.postMessage({ type: "reveal", line: node.line });
      });
      return wrapper;
    }

    function markFocusedRow(row, shouldScroll) {
      tree.querySelectorAll(".row[data-focused='true']").forEach((item) => {
        delete item.dataset.focused;
      });
      row.dataset.focused = "true";
      let current = row.parentElement;
      while (current) {
        const children = current.parentElement?.closest?.(".children");
        if (children) {
          children.hidden = false;
          const node = children.parentElement;
          const parentRow = node?.querySelector?.(":scope > .row");
          const chevron = parentRow?.querySelector?.(".chevron");
          parentRow?.setAttribute("aria-expanded", "true");
          if (chevron && chevron.textContent !== "·") chevron.textContent = "▾";
        }
        current = children?.parentElement;
      }
      if (shouldScroll) {
        row.scrollIntoView({ block: "center" });
      }
      row.focus();
    }

    window.addEventListener("message", (event) => {
      if (event.data?.type !== "focusNode") return;
      const row = tree.querySelector(".row[data-line='" + String(event.data.line) + "']");
      if (row) markFocusedRow(row, true);
    });

    if (!data.nodes || data.nodes.length === 0) {
      const empty = document.createElement("div");
      empty.className = "empty";
      empty.textContent = "No nodes found.";
      tree.appendChild(empty);
    } else {
      for (const node of data.nodes) tree.appendChild(renderNode(node));
    }

    document.getElementById("expand").addEventListener("click", () => {
      tree.querySelectorAll(".children").forEach((element) => { element.hidden = false; });
      tree.querySelectorAll(".row[aria-expanded]").forEach((row) => row.setAttribute("aria-expanded", "true"));
      tree.querySelectorAll(".chevron").forEach((element) => {
        if (element.textContent !== "·") element.textContent = "▾";
      });
    });
    document.getElementById("collapse").addEventListener("click", () => {
      tree.querySelectorAll(".node").forEach((node, index) => {
        const children = node.querySelector(":scope > .children");
        const chevron = node.querySelector(":scope > .row > .chevron");
        const row = node.querySelector(":scope > .row");
        if (!children || !chevron || !row) return;
        const shouldShow = index === 0;
        children.hidden = !shouldShow;
        row.setAttribute("aria-expanded", String(shouldShow));
        if (chevron.textContent !== "·") chevron.textContent = shouldShow ? "▾" : "▸";
      });
    });
  </script>
</body>
</html>`;
}

function serializeNodes(nodes, lineById, lines, depth = 0) {
  return (nodes ?? []).map((node) => ({
    title: node.title,
    id: node.id,
    tags: node.tags ?? [],
    fields: node.fields ?? {},
    line: node.id
      ? lineById.get(node.id) ?? findTitleLine(lines, node.title)
      : findTitleLine(lines, node.title),
    depth,
    children: serializeNodes(node.children, lineById, lines, depth + 1)
  }));
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
