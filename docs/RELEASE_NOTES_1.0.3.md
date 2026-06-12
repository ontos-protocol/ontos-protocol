# .ontos Protocol VS Code Extension 1.0.3

Extension-only patch for Cursor/VS Code tree-opening reliability.

## Fixed

- `.ontos: Open as Tree` now accepts explicit `Uri`, `path`, `fsPath`, and
  resource arguments instead of relying only on the active editor.
- Commands can recover the target `.ontos` file from the active tab, existing
  open tabs, open text documents, or a single-file workspace.
- Added `.ontos: Open Workspace File as Tree` for command-palette workflows
  where the active editor is not the target `.ontos` file.
- Added `.ontos: Open in Cursor Panel`, which opens Cursor's right-side editor
  panel when available and falls back to the standard `.ontos Tree` custom
  editor elsewhere.
- Cursor panel integration now sends `path: uri.fsPath` to Cursor's Glass file
  command, matching Cursor's own command shape.

## Compatibility

- Parser, CLI, viewer, and `.ontos Format 1.0` packages are unchanged.
- VS Code users receive the same `.ontos Tree` default editor behavior.
- Cursor users who previously opened `.ontos` as plain text are still migrated
  back to `.ontos Tree` when the extension activates.
