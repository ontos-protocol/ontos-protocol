# .ontos Protocol VS Code Extension 1.0.5

Patch release for automatic Cursor/VS Code first-open layout.

## Fixed

- New users opening a `.ontos` file now automatically get the intended layout:
  one main `.ontos Tree` editor plus the companion `Node Tree` side view.
- The extension now opens the `.ontos` view container and focuses
  `ontosNodeTree.focus` on first document open, so users do not need to run a
  command or press a shortcut to reveal the node navigator.
- The `1.0.4` duplicate-preview guard remains in place: the optional side Web
  Preview still does not auto-open a second full document tree while the main
  `.ontos Tree` editor is active.

## Install

Cursor, VSCodium, and other Open VSX clients should receive the update from
Open VSX. VS Code users should receive it from Visual Studio Marketplace.

Maintainers can install the exact VSIX locally:

```bash
code --install-extension .release/ontos-protocol-vscode-1.0.5.vsix
```

## Verification

Run:

```bash
npm run validate:vscode
npm run validate:extensions-package
npm run verify:extension-marketplaces
```
