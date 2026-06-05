# Runtime Targets

`.ontos Protocol` 1.0 uses native ESM packages and Node.js 20.19 or newer.

## Package Runtime

- `@ontos-protocol/parser`: ESM, Node.js 20.19+, browser-bundleable.
- `@ontos-protocol/schema`: ESM, Node.js 20.19+, browser-bundleable.
- `@ontos-protocol/cli`: ESM, Node.js 20.19+.
- `@ontos-protocol/viewer`: ESM, Node.js 20.19+, browser-bundleable.

CommonJS builds are not distributed in 1.0. CommonJS consumers can use dynamic
`import()` from Node.js, while browser and editor integrations consume bundled
artifacts.

## Bundled Artifacts

The static viewer app, VS Code extension, and Obsidian plugin are bundled with
esbuild for release. Bundled artifacts include source maps:

- `apps/viewer/dist/app.js.map`
- `extensions/vscode/dist/extension.js.map`
- `extensions/obsidian/dist/main.js.map`

Library packages ship source JavaScript directly, so separate source maps are
not required for those packages.
