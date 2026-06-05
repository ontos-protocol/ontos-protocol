import * as vscode from "vscode";
import { createViewerModel } from "@ontos-protocol/viewer";

export class OntosTreeProvider {
  constructor() {
    this._onDidChangeTreeData = new vscode.EventEmitter();
    this.onDidChangeTreeData = this._onDidChangeTreeData.event;
    this.document = undefined;
    this.roots = [];
    this.byId = new Map();
    this.byLine = new Map();
  }

  refresh(document) {
    if (!document || document.languageId !== "ontos") {
      this.document = undefined;
      this.roots = [];
      this.byId.clear();
      this.byLine.clear();
      this._onDidChangeTreeData.fire();
      return;
    }

    this.document = document;
    const lines = document.getText().split(/\r?\n/u);
    const lineById = nodeLineLookup(lines);
    const model = createViewerModel(document.getText());
    this.roots = (model.nodes ?? []).map((node) => treeNode(node, lineById, lines, document.uri, undefined));
    this.byId.clear();
    this.byLine.clear();
    registerTreeItems(this, this.roots);
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element) {
    const hasChildren = (element.children?.length ?? 0) > 0;
    const item = new vscode.TreeItem(
      element.title,
      hasChildren ? vscode.TreeItemCollapsibleState.Collapsed : vscode.TreeItemCollapsibleState.None
    );
    item.iconPath = new vscode.ThemeIcon(hasChildren ? "folder" : "symbol-file");
    item.tooltip = element.id
      ? `${element.title}\n@id(${element.id})\nLine ${element.line + 1}`
      : `${element.title}\nLine ${element.line + 1}`;
    item.command = {
      command: "ontos.revealNode",
      title: "Reveal node",
      arguments: [{ uri: element.uri, line: element.line, nodeId: element.id }]
    };
    item.contextValue = element.id ? "ontosNode" : "ontosNodeNoId";
    return item;
  }

  getChildren(element) {
    return element ? element.children ?? [] : this.roots;
  }

  getParent(element) {
    return element.parent;
  }

  findById(nodeId) {
    return this.byId.get(nodeId);
  }

  findByLine(line) {
    return this.byLine.get(line);
  }
}

function treeNode(node, lineById, lines, uri, parent) {
  const line = node.id
    ? lineById.get(node.id) ?? findTitleLine(lines, node.title)
    : findTitleLine(lines, node.title);
  const item = {
    title: node.title,
    id: node.id,
    line,
    uri,
    parent,
    children: []
  };
  item.children = (node.children ?? []).map((child) => treeNode(child, lineById, lines, uri, item));
  return item;
}

function registerTreeItems(provider, roots) {
  walkItems(roots, (item) => {
    if (item.id) {
      provider.byId.set(item.id, item);
    }
    provider.byLine.set(item.line, item);
  });
}

function walkItems(items, visitor) {
  for (const item of items) {
    visitor(item);
    if (item.children?.length) {
      walkItems(item.children, visitor);
    }
  }
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
