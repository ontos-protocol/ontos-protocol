import assert from "node:assert/strict";
import {
  TREE_TEXT_TAB_MIGRATION_VERSION,
  shouldPromoteOntosTextTab
} from "../extensions/vscode/src/openModeLogic.js";

assert.equal(TREE_TEXT_TAB_MIGRATION_VERSION, "1.0.2");

assert.equal(shouldPromoteOntosTextTab({
  isOntosTextTab: true,
  defaultEditor: "tree",
  hasTreeViewerTab: false,
  hasTextModeBypass: false
}), true, "restored .ontos text tabs should migrate into the tree editor");

assert.equal(shouldPromoteOntosTextTab({
  isOntosTextTab: true,
  defaultEditor: "text",
  hasTreeViewerTab: false,
  hasTextModeBypass: false
}), false, "explicit text default should be respected");

assert.equal(shouldPromoteOntosTextTab({
  isOntosTextTab: true,
  defaultEditor: "tree",
  hasTreeViewerTab: false,
  hasTextModeBypass: true
}), false, "current-session Open as Text bypass should be respected");

assert.equal(shouldPromoteOntosTextTab({
  isOntosTextTab: true,
  defaultEditor: "tree",
  hasTreeViewerTab: true,
  hasTextModeBypass: false
}), false, "text tab should not open a duplicate tree tab when one already exists");

assert.equal(shouldPromoteOntosTextTab({
  isOntosTextTab: false,
  defaultEditor: "tree",
  hasTreeViewerTab: false,
  hasTextModeBypass: false
}), false, "non-.ontos text tabs must never migrate");

assert.equal(shouldPromoteOntosTextTab({
  isOntosTextTab: true,
  defaultEditor: "text",
  hasTreeViewerTab: true,
  hasTextModeBypass: true,
  force: true
}), true, "forced Open as Tree should override text preferences and bypasses");

console.log("VS Code open mode migration tests ok");
