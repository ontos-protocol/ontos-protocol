import * as vscode from "vscode";
import { createViewerModel } from "@ontos-protocol/viewer";
import { suppressTreePromotion } from "./openMode.js";

const panelsByUri = new Map();

export function openOrUpdatePreview(context, document) {
  if (!document || document.languageId !== "ontos") {
    return;
  }
  const key = document.uri.toString();
  let panel = panelsByUri.get(key);
  if (!panel) {
    panel = vscode.window.createWebviewPanel(
      "ontosInteractivePreview",
      ".ontos Tree Preview",
      vscode.ViewColumn.Beside,
      {
        enableScripts: true,
        retainContextWhenHidden: true,
        localResourceRoots: []
      }
    );
    panelsByUri.set(key, panel);
    panel.onDidDispose(() => panelsByUri.delete(key));
    panel.webview.onDidReceiveMessage((message) => {
      if (message?.type === "reveal" && typeof message.line === "number") {
        void revealLine(document, message.line);
      }
    });
    context.subscriptions.push(panel);
  }
  panel.title = document.fileName;
  panel.webview.html = previewHtml(document);
  panel.reveal(vscode.ViewColumn.Beside, true);
}

async function revealLine(document, requestedLine) {
  suppressTreePromotion(document.uri);
  const editor = await vscode.window.showTextDocument(document, {
    viewColumn: vscode.ViewColumn.Active,
    preserveFocus: false
  });
  const line = Math.min(Math.max(requestedLine, 0), editor.document.lineCount - 1);
  const position = new vscode.Position(line, 0);
  const range = new vscode.Range(position, position);
  editor.revealRange(range, vscode.TextEditorRevealType.InCenter);
  editor.selection = new vscode.Selection(position, position);
}

function previewHtml(document) {
  const lines = document.getText().split(/\r?\n/u);
  const lineById = nodeLineLookup(lines);
  const model = createViewerModel(document.getText());
  const payload = {
    title: model.title,
    metadata: model.metadata,
    stats: model.stats,
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
      --bg: var(--vscode-editor-background, #fff);
      --fg: var(--vscode-editor-foreground, #1f2937);
      --muted: var(--vscode-descriptionForeground, #64748b);
      --line: var(--vscode-panel-border, #d9dee7);
      --accent: var(--vscode-textLink-foreground, #0b6bcb);
    }
    * { box-sizing: border-box; }
    body { margin: 0; background: var(--bg); color: var(--fg); font: 13px/1.45 var(--vscode-font-family, system-ui, sans-serif); }
    header { padding: 12px 14px; border-bottom: 1px solid var(--line); }
    h1 { margin: 0 0 4px; font-size: 16px; }
    .meta { margin: 0; color: var(--muted); font-size: 12px; }
    .toolbar { display: flex; gap: 8px; padding: 10px 14px; border-bottom: 1px solid var(--line); position: sticky; top: 0; background: var(--bg); }
    button, input { font: inherit; }
    button { border: 1px solid var(--line); background: transparent; color: var(--fg); border-radius: 4px; padding: 4px 8px; cursor: pointer; }
    input { flex: 1; min-width: 120px; border: 1px solid var(--line); border-radius: 4px; padding: 4px 8px; background: var(--bg); color: var(--fg); }
    main { padding: 10px 14px 24px; }
    details { margin: 6px 0 6px 12px; border-left: 1px solid var(--line); padding-left: 10px; }
    details[data-depth="0"] { margin-left: 0; border-left-color: var(--accent); }
    summary { cursor: pointer; font-weight: 600; }
    .tags { color: var(--muted); margin-left: 6px; font-size: 11px; }
    .field { color: var(--muted); margin: 4px 0 4px 12px; overflow-wrap: anywhere; }
    .goto { margin-left: 8px; color: var(--accent); border: 0; padding: 0; text-decoration: underline; }
    .hidden { display: none; }
  </style>
</head>
<body>
  <header>
    <h1 id="title"></h1>
    <p class="meta" id="meta"></p>
  </header>
  <div class="toolbar">
    <button type="button" id="expand">Expand</button>
    <button type="button" id="collapse">Collapse</button>
    <input type="search" id="search" placeholder="Search nodes and fields" aria-label="Search">
  </div>
  <main id="tree" role="tree"></main>
  <script nonce="${nonce}">window.__ONTOS__ = ${json};</script>
  <script nonce="${nonce}">
    const vscode = acquireVsCodeApi();
    const data = window.__ONTOS__;
    const tree = document.getElementById("tree");
    document.getElementById("title").textContent = data.title || "Untitled";
    document.getElementById("meta").textContent =
      Object.entries(data.metadata || {}).filter(([key]) => key !== "title").map(([key, value]) => "@" + key + " " + value).join(" · ");

    function textValue(value) {
      if (Array.isArray(value)) return value.join(" · ");
      if (value && typeof value === "object" && "value" in value) return textValue(value.value);
      return String(value ?? "");
    }

    function renderNode(node) {
      const details = document.createElement("details");
      details.dataset.depth = String(node.depth || 0);
      details.open = node.depth === 0;
      const summary = document.createElement("summary");
      summary.textContent = node.title;
      for (const tag of node.tags || []) {
        const span = document.createElement("span");
        span.className = "tags";
        span.textContent = "#" + tag;
        summary.appendChild(span);
      }
      const go = document.createElement("button");
      go.type = "button";
      go.className = "goto";
      go.textContent = "Edit";
      go.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        vscode.postMessage({ type: "reveal", line: node.line });
      });
      summary.appendChild(go);
      details.appendChild(summary);
      for (const [key, value] of Object.entries(node.fields || {})) {
        const field = document.createElement("div");
        field.className = "field";
        field.textContent = key + ": " + textValue(value);
        details.appendChild(field);
      }
      for (const child of node.children || []) details.appendChild(renderNode(child));
      return details;
    }

    for (const node of data.nodes || []) tree.appendChild(renderNode(node));
    document.getElementById("expand").addEventListener("click", () => {
      tree.querySelectorAll("details").forEach((details) => { details.open = true; });
    });
    document.getElementById("collapse").addEventListener("click", () => {
      tree.querySelectorAll("details").forEach((details) => { details.open = details.dataset.depth === "0"; });
    });
    document.getElementById("search").addEventListener("input", (event) => {
      const query = event.target.value.trim().toLowerCase();
      tree.querySelectorAll("details").forEach((details) => {
        const match = query === "" || details.textContent.toLowerCase().includes(query);
        details.classList.toggle("hidden", !match);
        if (match && query) details.open = true;
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
