import * as vscode from "vscode";

const pendingTreeOpen = new Set();
const textModeBypass = new Map();

export function hasTreeViewerTab(uri) {
  const key = uri.toString();
  for (const group of vscode.window.tabGroups.all) {
    for (const tab of group.tabs) {
      if (
        tab.input instanceof vscode.TabInputCustom &&
        tab.input.viewType === "ontos.nativeViewer" &&
        tab.input.uri.toString() === key
      ) {
        return true;
      }
    }
  }
  return false;
}

export function schedulePromoteToTreeViewer(uri) {
  setTimeout(() => {
    void promoteToTreeViewer(uri);
  }, 80);
}

export async function promoteToTreeViewer(uri, options = {}) {
  const key = uri.toString();
  if (pendingTreeOpen.has(key) || (!options.force && hasTextModeBypass(uri))) {
    return;
  }
  const config = vscode.workspace.getConfiguration("ontos");
  if (!options.force && config.get("defaultEditor", "tree") !== "tree") {
    return;
  }
  if (hasTreeViewerTab(uri)) {
    await closeTextTabsForUri(uri);
    return;
  }

  pendingTreeOpen.add(key);
  try {
    await vscode.commands.executeCommand(
      "vscode.openWith",
      uri,
      "ontos.nativeViewer",
      { viewColumn: vscode.ViewColumn.Active, preserveFocus: false }
    );
    await closeTextTabsForUri(uri);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    void vscode.window.showErrorMessage(`.ontos tree viewer failed to open: ${message}`);
  } finally {
    pendingTreeOpen.delete(key);
  }
}

export async function openAsTextEditor(uri) {
  suppressTreePromotion(uri);
  await vscode.commands.executeCommand("vscode.openWith", uri, "default", {
    viewColumn: vscode.ViewColumn.Active,
    preserveFocus: false
  });
}

export function suppressTreePromotion(uri, durationMs = 1500) {
  const key = uri.toString();
  textModeBypass.set(key, Date.now() + durationMs);
}

function hasTextModeBypass(uri) {
  const key = uri.toString();
  const expires = textModeBypass.get(key);
  if (!expires) {
    return false;
  }
  if (Date.now() > expires) {
    textModeBypass.delete(key);
    return false;
  }
  return true;
}

async function closeTextTabsForUri(uri) {
  const key = uri.toString();
  const tabs = [];
  for (const group of vscode.window.tabGroups.all) {
    for (const tab of group.tabs) {
      if (tab.input instanceof vscode.TabInputText && tab.input.uri.toString() === key) {
        tabs.push(tab);
      }
    }
  }
  if (tabs.length > 0) {
    await vscode.window.tabGroups.close(tabs);
  }
}
