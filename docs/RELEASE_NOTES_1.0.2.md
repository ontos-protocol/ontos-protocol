# .ontos Protocol VS Code Extension 1.0.2

This extension-only patch fixes the Cursor and VS Code first-open experience for
`.ontos` files.

## Fixed

- Restored `.ontos` text tabs from older Cursor or VS Code sessions now migrate
  back into `.ontos Tree` automatically unless the user explicitly selected text
  mode.
- The main `.ontos Tree` editor now uses a clearer custom tree surface with
  stable disclosure controls, node metadata, search, and collapsed long fields.
- Expand, Collapse, chevrons, and accessibility state now stay synchronized.
- The optional side preview now uses the same custom tree renderer as the main
  editor instead of native browser disclosure controls.
- Native text-editor folding is disabled by default behind `ontos.textFolding`
  so the tree editor is the primary folding surface.

## Distribution

- Publish the same VSIX to Open VSX and Visual Studio Marketplace.
- Attach `ontos-protocol-vscode-1.0.2.vsix` and `SHA256SUMS` to this GitHub
  release.
- No npm packages changed in this patch.
