export const TREE_TEXT_TAB_MIGRATION_VERSION = "1.0.3";

export function shouldPromoteOntosTextTab(options = {}) {
  const {
    isOntosTextTab,
    defaultEditor = "tree",
    hasTreeViewerTab = false,
    hasTextModeBypass = false,
    force = false
  } = options;

  if (!isOntosTextTab) {
    return false;
  }
  if (force) {
    return true;
  }
  if (defaultEditor === "text") {
    return false;
  }
  if (hasTextModeBypass || hasTreeViewerTab) {
    return false;
  }
  return true;
}
