# Obsidian Community Submission Checklist

Use this checklist before submitting the `.ontos Protocol` plugin to the
Obsidian community plugin review queue.

- [ ] Confirm `manifest.json` uses plugin ID `ontos-protocol`.
- [ ] Confirm `manifest.json` version matches the release tag.
- [ ] Confirm `versions.json` is added if required by the submission flow.
- [ ] Confirm `main.js`, `manifest.json`, and `styles.css` are built in `dist/`.
- [ ] Confirm the example vault opens the plugin from `.obsidian/plugins/ontos-protocol/`.
- [ ] Confirm preview opens for `vault/project-state.ontos`.
- [ ] Confirm `[[node-id]]` references resolve in preview.
- [ ] Confirm backlinks are shown for resolvable references.
- [ ] Confirm Markdown export writes beside the active file.
- [ ] Confirm settings save and reload.
- [ ] Confirm no network access is required.
- [ ] Confirm README includes a screenshot and local build instructions.
- [ ] Run `npm run validate:obsidian`.
- [ ] Run `npm run validate:extensions-package`.
- [ ] Submit only after the public repository is available.
