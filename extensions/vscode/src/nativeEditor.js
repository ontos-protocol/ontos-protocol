import * as vscode from "vscode";
import {
  openAsTextEditor,
  suppressTreePromotion
} from "./openMode.js";
import { treeWebviewHtml } from "./webviewTree.js";

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
      webview.html = treeWebviewHtml(document.getText());
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
      if (message?.type === "openText") {
        void openAsTextEditor(document.uri);
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
