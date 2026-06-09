import * as vscode from "vscode";
import {
  formatOntosDocument,
  parseOntosDocument,
  validateOntosDocument
} from "@ontos-protocol/parser";
import {
  exportHtml,
  exportJson,
  exportMarkdown,
  exportOpml
} from "@ontos-protocol/cli/exporters";
import { convertMarkdownToOntosResult } from "@ontos-protocol/cli/importers";
import {
  createNodePack,
  exportPackMarkdown
} from "@ontos-protocol/cli/packs";
import { OntosNativeEditorProvider } from "./nativeEditor.js";
import {
  createTransientNodePack,
  nodeInfoAtLine
} from "./extensionLogic.js";
import {
  openAsTextEditor,
  promoteToTreeViewer,
  schedulePromoteToTreeViewer,
  suppressTreePromotion
} from "./openMode.js";
import { OntosTreeProvider } from "./treeProvider.js";
import { openOrUpdatePreview } from "./webviewPreview.js";

const selector = { language: "ontos", scheme: "file" };
const DEPTH_BANDS = [
  "#0b6bcb14",
  "#2d8f4712",
  "#9a6b0712",
  "#8b5cf612",
  "#e85d5d10"
];
const GUIDE_COLORS = [
  "#0b6bcb55",
  "#2d8f4755",
  "#9a6b0755",
  "#8b5cf655",
  "#e85d5d55"
];

export function activate(context) {
  const diagnostics = vscode.languages.createDiagnosticCollection("ontos");
  const indentDecorations = registerIndentDecorations(context);
  const focusedNodeByUri = new Map();
  let selectedTreeNode;
  const treeProvider = new OntosTreeProvider();
  const nativeEditor = new OntosNativeEditorProvider({
    onFocusNode: (event) => {
      const key = event.uri.toString();
      focusedNodeByUri.set(key, event);
      const item = event.nodeId ? treeProvider.findById(event.nodeId) : treeProvider.findByLine(event.line);
      if (item) {
        selectedTreeNode = item;
        void treeView.reveal(item, { select: true, focus: false, expand: true });
      }
    }
  });
  const treeView = vscode.window.createTreeView("ontosNodeTree", {
    treeDataProvider: treeProvider,
    showCollapseAll: true
  });

  context.subscriptions.push(
    diagnostics,
    treeView,
    vscode.window.registerCustomEditorProvider("ontos.nativeViewer", nativeEditor, {
      webviewOptions: { retainContextWhenHidden: true },
      supportsMultipleEditorsPerDocument: false
    })
  );

  const validateDocument = (document) => {
    if (!isOntosDocument(document)) {
      return;
    }
    diagnostics.set(document.uri, createDiagnostics(document));
  };

  const refreshUi = (document) => {
    const activeDocument = isOntosDocument(document) ? document : activeOntosDocument(false);
    const isOntos = Boolean(activeDocument);
    void vscode.commands.executeCommand("setContext", "ontos:active", isOntos);
    if (!activeDocument) {
      treeProvider.refresh(undefined);
      return;
    }
    treeProvider.refresh(activeDocument);
    const config = vscode.workspace.getConfiguration("ontos");
    if (config.get("focusSidebarOnOpen", false)) {
      void vscode.commands.executeCommand("workbench.view.extension.ontos");
    }
    if (config.get("autoPreview", false)) {
      openOrUpdatePreview(context, activeDocument);
    }
  };

  const handleOntosDocument = (document) => {
    if (!isOntosDocument(document)) {
      return;
    }
    validateDocument(document);
    schedulePromoteToTreeViewer(document.uri);
    refreshUi(document);
  };

  for (const document of vscode.workspace.textDocuments) {
    handleOntosDocument(document);
  }

  context.subscriptions.push(
    vscode.workspace.onDidOpenTextDocument(handleOntosDocument),
    treeView.onDidChangeSelection((event) => {
      selectedTreeNode = event.selection[0];
      if (selectedTreeNode) {
        focusedNodeByUri.set(selectedTreeNode.uri.toString(), {
          uri: selectedTreeNode.uri,
          line: selectedTreeNode.line,
          nodeId: selectedTreeNode.id
        });
        nativeEditor.focusNode(selectedTreeNode.uri, selectedTreeNode);
      }
    }),
    vscode.window.onDidChangeActiveTextEditor((editor) => {
      if (isOntosDocument(editor?.document)) {
        schedulePromoteToTreeViewer(editor.document.uri);
      }
      refreshUi(editor?.document);
      indentDecorations.refresh(editor?.document);
    }),
    vscode.window.tabGroups.onDidChangeTabs(() => refreshUi()),
    vscode.workspace.onDidChangeTextDocument((event) => {
      validateDocument(event.document);
      refreshUi(event.document);
      indentDecorations.refresh(event.document);
    }),
    vscode.workspace.onDidSaveTextDocument((document) => {
      const enabled = vscode.workspace.getConfiguration("ontos").get("validateOnSave", true);
      if (enabled) {
        validateDocument(document);
      }
      if (isOntosDocument(document)) {
        schedulePromoteToTreeViewer(document.uri);
      }
      refreshUi(document);
      indentDecorations.refresh(document);
    }),
    vscode.window.onDidChangeTextEditorSelection((event) => {
      if (event.textEditor.document.languageId !== "ontos") {
        return;
      }
      const node = nodeAtCursor(event.textEditor.document, event.textEditor.selection.active.line);
      if (!node?.id) {
        return;
      }
      const item = treeProvider.findById(node.id);
      if (item) {
        void treeView.reveal(item, { select: true, focus: false, expand: true });
      }
    }),
    vscode.languages.registerDocumentFormattingEditProvider(selector, {
      provideDocumentFormattingEdits(document) {
        const formatted = formatOntosDocument(document.getText());
        return [vscode.TextEdit.replace(fullRange(document), formatted)];
      }
    }),
    vscode.languages.registerDocumentSymbolProvider(selector, {
      provideDocumentSymbols(document) {
        return documentSymbols(document);
      }
    }),
    vscode.languages.registerFoldingRangeProvider(selector, {
      provideFoldingRanges(document) {
        return foldingRanges(document);
      }
    }),
    vscode.commands.registerCommand("ontos.validate", () => {
      const document = activeOntosDocument();
      if (!document) {
        return;
      }
      validateDocument(document);
      const count = validateOntosDocument(document.getText()).length;
      vscode.window.showInformationMessage(
        count === 0 ? ".ontos document is valid." : `.ontos document has ${count} diagnostics.`
      );
    }),
    vscode.commands.registerCommand("ontos.format", async () => {
      const document = activeOntosDocument();
      if (!document) {
        return;
      }
      const editor = await openTextEditorAt(document.uri, 0, { preserveFocus: false });
      const formatted = formatOntosDocument(editor.document.getText());
      await editor.edit((edit) => edit.replace(fullRange(editor.document), formatted));
      validateDocument(editor.document);
      refreshUi(editor.document);
      if (vscode.workspace.getConfiguration("ontos").get("defaultEditor", "tree") === "tree") {
        await promoteToTreeViewer(editor.document.uri, { force: true });
      }
    }),
    vscode.commands.registerCommand("ontos.exportMarkdown", () => exportActive("md")),
    vscode.commands.registerCommand("ontos.exportHtml", () => exportActive("html")),
    vscode.commands.registerCommand("ontos.exportJson", () => exportActive("json")),
    vscode.commands.registerCommand("ontos.exportOpml", () => exportActive("opml")),
    vscode.commands.registerCommand("ontos.copyNodeId", () => copyNodeValue("id")),
    vscode.commands.registerCommand("ontos.copyNodePath", () => copyNodeValue("path")),
    vscode.commands.registerCommand("ontos.copyNodeText", () => copyNodeValue("text")),
    vscode.commands.registerCommand("ontos.contextPack", () => copyPack("context")),
    vscode.commands.registerCommand("ontos.reviewPack", () => copyPack("review")),
    vscode.commands.registerCommand("ontos.handoffPack", () => copyPack("handoff")),
    vscode.commands.registerCommand("ontos.modifyBoundaryPack", () => copyPack("modify-boundary")),
    vscode.commands.registerCommand("ontos.verificationPack", () => copyPack("verification")),
    vscode.commands.registerCommand("ontos.preview", () => {
      const document = activeOntosDocument();
      if (document) {
        openOrUpdatePreview(context, document);
      }
    }),
    vscode.commands.registerCommand("ontos.convertMarkdown", async () => {
      await convertActiveMarkdown();
    }),
    vscode.commands.registerCommand("ontos.openAsText", async () => {
      const document = activeOntosDocument();
      if (document) {
        await openAsTextEditor(document.uri);
      }
    }),
    vscode.commands.registerCommand("ontos.openAsTree", async () => {
      const document = activeOntosDocument();
      if (document) {
        await promoteToTreeViewer(document.uri, { force: true });
      }
    }),
    vscode.commands.registerCommand("ontos.revealNode", async (args) => {
      if (!args?.uri || typeof args.line !== "number") {
        return;
      }
      const item = args.nodeId ? treeProvider.findById(args.nodeId) : treeProvider.findByLine(args.line);
      if (item) {
        selectedTreeNode = item;
        void treeView.reveal(item, { select: true, focus: false, expand: true });
      }
      nativeEditor.focusNode(args.uri, args);
      await openTextEditorAt(args.uri, args.line);
    }),
    vscode.commands.registerCommand("ontos.focusTree", () => {
      void vscode.commands.executeCommand("ontosNodeTree.focus");
    }),
    vscode.commands.registerCommand("ontos.refreshTree", () => {
      refreshUi();
    })
  );
}

export function deactivate() {}

function registerIndentDecorations(context) {
  const guideTypes = GUIDE_COLORS.map((color) =>
    vscode.window.createTextEditorDecorationType({
      borderStyle: "solid",
      borderWidth: "0 0 0 1px",
      borderColor: color,
      isWholeLine: false
    })
  );
  const bandType = vscode.window.createTextEditorDecorationType({
    isWholeLine: true
  });

  context.subscriptions.push(...guideTypes, bandType);

  const refresh = (document) => {
    const editor = vscode.window.activeTextEditor;
    if (!editor || !document || editor.document !== document || document.languageId !== "ontos") {
      return;
    }

    const config = vscode.workspace.getConfiguration("ontos");
    const guidesEnabled = config.get("indentGuides", true);
    const bandsEnabled = config.get("depthBands", false);
    if (!guidesEnabled && !bandsEnabled) {
      editor.setDecorations(bandType, []);
      for (const type of guideTypes) {
        editor.setDecorations(type, []);
      }
      return;
    }

    const lines = document.getText().split(/\r?\n/u);
    const guideBuckets = guideTypes.map(() => []);
    const bandDecorations = [];

    for (let line = 0; line < lines.length; line += 1) {
      const text = lines[line];
      if (text.trim() === "" || text.trimStart().startsWith("//")) {
        continue;
      }
      const indent = text.match(/^( *)/u)?.[1]?.length ?? 0;
      const depth = Math.floor(indent / 2);
      if (bandsEnabled && depth > 0) {
        bandDecorations.push({
          range: new vscode.Range(line, 0, line, Math.max(text.length, 1)),
          renderOptions: {
            backgroundColor: DEPTH_BANDS[Math.min(depth - 1, DEPTH_BANDS.length - 1)]
          }
        });
      }
      if (guidesEnabled) {
        for (let level = 1; level <= depth; level += 1) {
          const column = level * 2;
          const guideIndex = Math.min(level - 1, guideTypes.length - 1);
          guideBuckets[guideIndex].push(new vscode.Range(line, column, line, column));
        }
      }
    }

    editor.setDecorations(bandType, bandsEnabled ? bandDecorations : []);
    for (let index = 0; index < guideTypes.length; index += 1) {
      editor.setDecorations(guideTypes[index], guidesEnabled ? guideBuckets[index] : []);
    }
  };

  for (const document of vscode.workspace.textDocuments) {
    refresh(document);
  }

  return { refresh };
}

function createDiagnostics(document) {
  return validateOntosDocument(document.getText()).map((diagnostic) => {
    const source = diagnostic.source?.start;
    const line = Math.max((source?.line ?? 1) - 1, 0);
    const column = Math.max((source?.column ?? 1) - 1, 0);
    const range = new vscode.Range(line, column, line, column + 1);
    const severity = diagnostic.severity === "error"
      ? vscode.DiagnosticSeverity.Error
      : diagnostic.severity === "warning"
        ? vscode.DiagnosticSeverity.Warning
        : vscode.DiagnosticSeverity.Information;
    const item = new vscode.Diagnostic(range, `${diagnostic.code}: ${diagnostic.message}`, severity);
    item.source = ".ontos";
    item.code = diagnostic.code;
    return item;
  });
}

function documentSymbols(document) {
  const ast = parseOntosDocument(document.getText(), { includeDiagnostics: false });
  const symbols = [];
  const lines = document.getText().split(/\r?\n/u);
  const nodeLine = nodeLineLookup(lines);

  function append(node, parent) {
    const line = node.id ? nodeLine.get(node.id) ?? findTitleLine(lines, node.title) : findTitleLine(lines, node.title);
    const range = new vscode.Range(line, 0, line, Math.max(lines[line]?.length ?? 1, 1));
    const symbol = new vscode.DocumentSymbol(
      node.title,
      node.id ?? "",
      vscode.SymbolKind.Object,
      range,
      range
    );
    if (parent) {
      parent.children.push(symbol);
    } else {
      symbols.push(symbol);
    }
    for (const child of node.children ?? []) {
      append(child, symbol);
    }
  }

  for (const node of ast.nodes ?? []) {
    append(node);
  }
  return symbols;
}

function foldingRanges(document) {
  const lines = document.getText().split(/\r?\n/u);
  const ranges = [];
  const stack = [];
  for (let index = 0; index < lines.length; index += 1) {
    const match = lines[index].match(/^(\s*)-\s+/u);
    if (!match) {
      continue;
    }
    const indent = match[1].length;
    while (stack.length > 0 && stack[stack.length - 1].indent >= indent) {
      const previous = stack.pop();
      if (index - previous.line > 1) {
        ranges.push(new vscode.FoldingRange(previous.line, index - 1));
      }
    }
    stack.push({ indent, line: index });
  }
  while (stack.length > 0) {
    const previous = stack.pop();
    if (lines.length - previous.line > 1) {
      ranges.push(new vscode.FoldingRange(previous.line, lines.length - 1));
    }
  }
  return ranges;
}

function exportActive(target) {
  const document = activeOntosDocument();
  if (!document) {
    return;
  }
  const ast = parseOntosDocument(document.getText(), { includeDiagnostics: false });
  const content = {
    md: exportMarkdown,
    html: exportHtml,
    json: exportJson,
    opml: exportOpml
  }[target](ast);
  const language = target === "md" ? "markdown" : target === "opml" ? "xml" : target;
  void vscode.workspace.openTextDocument({ content, language }).then((doc) => vscode.window.showTextDocument(doc));
}

function copyNodeValue(kind) {
  const context = resolveActiveNodeContext();
  if (!context) {
    vscode.window.showWarningMessage("Select a .ontos node in the tree or open the text editor for a .ontos document first.");
    return;
  }

  if (kind === "id" && !context.info.node.id) {
    vscode.window.showWarningMessage("This node has no @id(...). Copy path or text instead, or add a stable ID.");
    return;
  }

  const text = kind === "id"
    ? context.info.node.id
    : kind === "path"
      ? context.info.path.join(" > ")
      : context.info.text;
  void vscode.env.clipboard.writeText(text);
}

function copyPack(kind) {
  const context = resolveActiveNodeContext();
  if (!context) {
    vscode.window.showWarningMessage("Select a .ontos node in the tree before creating an AI pack.");
    return;
  }
  const ast = parseOntosDocument(context.document.getText(), { includeDiagnostics: false });
  const pack = context.info.node.id
    ? createNodePack(ast, context.info.node.id, kind)
    : createTransientNodePack(ast, context.info, kind);
  void vscode.env.clipboard.writeText(exportPackMarkdown(pack));
}

async function convertActiveMarkdown() {
  const document = vscode.window.activeTextEditor?.document;
  if (!document || !isMarkdownDocument(document)) {
    vscode.window.showWarningMessage("Open a Markdown document first.");
    return;
  }

  const fallbackTitle = document.uri.scheme === "file"
    ? document.uri.fsPath.split(/[\\/]/u).at(-1)?.replace(/\.[^.]+$/u, "") ?? "Imported Markdown"
    : "Imported Markdown";
  const result = convertMarkdownToOntosResult(document.getText(), fallbackTitle);
  const converted = await vscode.workspace.openTextDocument({
    content: result.document,
    language: "ontos"
  });
  await vscode.window.showTextDocument(converted, {
    viewColumn: vscode.ViewColumn.Beside,
    preserveFocus: false
  });
  const warningCount = result.report.warnings.length;
  vscode.window.showInformationMessage(
    warningCount === 0
      ? "Markdown converted to .ontos."
      : `Markdown converted to .ontos with ${warningCount} warning${warningCount === 1 ? "" : "s"}.`
  );
}

function activeOntosDocument(showWarning = true) {
  const editorDocument = vscode.window.activeTextEditor?.document;
  if (isOntosDocument(editorDocument)) {
    return editorDocument;
  }

  const tab = vscode.window.tabGroups.activeTabGroup.activeTab;
  const input = tab?.input;
  const uri = input instanceof vscode.TabInputCustom && input.viewType === "ontos.nativeViewer"
    ? input.uri
    : input instanceof vscode.TabInputText
      ? input.uri
      : undefined;

  if (uri?.fsPath?.endsWith(".ontos")) {
    const document = vscode.workspace.textDocuments.find((item) => item.uri.toString() === uri.toString());
    if (document?.languageId === "ontos" || document?.uri.fsPath.endsWith(".ontos")) {
      return document;
    }
  }

  if (showWarning) {
    vscode.window.showWarningMessage("Open a .ontos document first.");
  }
  return undefined;
}

function isOntosDocument(document) {
  return Boolean(document && (
    document.languageId === "ontos" ||
    document.uri?.fsPath?.toLowerCase().endsWith(".ontos")
  ));
}

function nodeAtCursor(document, line) {
  return nodeInfoAtLine(document, line)?.node;
}

function isMarkdownDocument(document) {
  return document.languageId === "markdown" || /\.(md|markdown)$/iu.test(document.uri.fsPath ?? "");
}

function resolveActiveNodeContext() {
  const editor = vscode.window.activeTextEditor;
  if (editor?.document.languageId === "ontos") {
    const info = nodeInfoAtLine(editor.document, editor.selection.active.line);
    return info ? { document: editor.document, info } : undefined;
  }

  const document = activeOntosDocument(false);
  if (!document) {
    return undefined;
  }

  if (selectedTreeNode?.uri?.toString() === document.uri.toString()) {
    const info = nodeInfoAtLine(document, selectedTreeNode.line);
    if (info) {
      return { document, info };
    }
  }

  const focused = focusedNodeByUri.get(document.uri.toString());
  if (focused) {
    const info = nodeInfoAtLine(document, focused.line);
    if (info) {
      return { document, info };
    }
  }

  return undefined;
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

async function openTextEditorAt(uri, requestedLine, options = {}) {
  suppressTreePromotion(uri);
  const document = await vscode.workspace.openTextDocument(uri);
  const editor = await vscode.window.showTextDocument(document, {
    viewColumn: vscode.ViewColumn.Beside,
    preserveFocus: options.preserveFocus ?? false
  });
  const line = Math.min(Math.max(requestedLine, 0), editor.document.lineCount - 1);
  const position = new vscode.Position(line, 0);
  const range = new vscode.Range(position, position);
  editor.revealRange(range, vscode.TextEditorRevealType.InCenter);
  editor.selection = new vscode.Selection(position, position);
  return editor;
}

function fullRange(document) {
  const last = document.lineAt(document.lineCount - 1);
  return new vscode.Range(0, 0, document.lineCount - 1, last.text.length);
}
