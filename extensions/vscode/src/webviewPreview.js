import * as vscode from "vscode";
import {
  openAsTextEditor,
  suppressTreePromotion
} from "./openMode.js";
import { treeWebviewHtml } from "./webviewTree.js";

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
      if (message?.type === "openText") {
        void openAsTextEditor(document.uri);
        return;
      }
      if (message?.type === "reveal" && typeof message.line === "number") {
        void revealLine(document, message.line);
      }
    });
    context.subscriptions.push(panel);
  }
  panel.title = document.fileName;
  panel.webview.html = treeWebviewHtml(document.getText(), { showDiagnostics: false });
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
