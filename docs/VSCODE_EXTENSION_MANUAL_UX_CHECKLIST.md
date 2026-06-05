# VS Code Extension Manual UX Checklist

Run this checklist before publishing `.ontos Protocol 1.0.0`.

Record one pass in VS Code and one pass in Cursor. Use the same built extension
artifact that will be published.

| # | Action | Expected Result |
|---|---|---|
| 1 | Open `examples/project-state.ontos` in an extension development host. | Main tab is `.ontos Tree`, not a plain text editor. |
| 2 | Click a node disclosure control. | Child nodes collapse and expand. |
| 3 | Click `Edit` on a node. | A text editor opens beside the tree and reveals the source line. |
| 4 | Close the text editor and leave only the tree tab open, then run `.ontos: Validate Document`. | Validation runs against the active `.ontos` document. |
| 5 | Run `.ontos: Open as Text`. | The text editor opens and the tree does not immediately take focus back. |
| 6 | Run `.ontos: Open as Tree`. | The document returns to `.ontos Tree`. |
| 7 | Confirm `ontos.autoPreview` is `false`, then open a `.ontos` file. | No side Web Preview opens automatically. |
| 8 | Click a node in the Node Tree side view. | The main tree highlights or scrolls to the same node. |
| 9 | Use `.ontos: Copy Node Path` on a node without `@id(...)`. | Clipboard contains the node path. |
| 10 | Open a Markdown file and run `.ontos: Convert Markdown to .ontos`. | A new `.ontos` document opens and validates. |

## Evidence

| Host | Version | Extension Artifact | Tester | Date | Result | Notes |
|---|---|---|---|---|---|---|
| VS Code | TBD | TBD | TBD | TBD | TBD | TBD |
| Cursor | TBD | TBD | TBD | TBD | TBD | TBD |

Do not mark the release approval packet complete until both rows are filled.
