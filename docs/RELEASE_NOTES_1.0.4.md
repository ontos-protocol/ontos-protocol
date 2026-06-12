# .ontos Protocol VS Code Extension 1.0.4

Patch release for Cursor/VS Code first-open clarity.

## Fixed

- The default `.ontos Tree` editor now stays singular: enabling
  `ontos.autoPreview` no longer opens a duplicate side tree when `.ontos` files
  already open in the main tree custom editor.
- The companion `Node Tree` side view remains enabled by default, but opens only
  once per document so it does not fight normal node clicking or collapsing.
- Optional side preview is now limited to explicit text-mode workflows
  (`ontos.defaultEditor: "text"`), where it can act as a companion preview
  without competing with the main tree editor.
- Package validation now checks that the duplicate-preview guard is present in
  the extension source and bundled VSIX.

## Install

Cursor, VSCodium, and other Open VSX clients should receive the update from
Open VSX. VS Code users should receive it from Visual Studio Marketplace.

Maintainers can install the exact VSIX locally:

```bash
code --install-extension .release/ontos-protocol-vscode-1.0.4.vsix
```

## Verification

Run:

```bash
npm run validate:vscode
npm run validate:extensions-package
npm run verify:extension-marketplaces
```
