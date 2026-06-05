# 60-Second Demo Video Script

This script is for the first `.ontos Protocol 1.0.0` launch video.

## Goal

Show that `.ontos` is plain text project context that humans can review and AI
tools can use without a hosted service.

## Runtime

60 seconds.

## Generated Asset

The launch demo is a silent captioned MP4 generated from this storyboard.

Build:

```bash
npm run demo:video
```

Validate:

```bash
npm run validate:demo-video
```

Output:

```text
.release/ontos-protocol-60s-demo.mp4
```

The generated file is ignored by Git and should be uploaded as a launch asset
or referenced from the launch article after review.

## Storyboard

### 0-5s: Problem

Visual: a long Markdown release note with scattered status and handoff details.

Voiceover:

Project context is no longer just documentation. AI tools need stable,
structured context they can read, update, and hand off.

### 5-15s: Format

Visual: `examples/project-state.ontos`.

Voiceover:

`.ontos Protocol` keeps project context in plain text. Nodes have stable IDs,
fields, tags, references, verification steps, and AI boundaries.

### 15-25s: CLI

Visual:

```bash
ontosfmt validate examples/project-state.ontos
ontosfmt inspect examples/project-state.ontos
```

Voiceover:

The `ontosfmt` CLI validates, formats, inspects, imports, exports, and prepares
AI context packs.

### 25-38s: AI Handoff

Visual:

```bash
ontosfmt pack examples/ai-handoff.ontos --node handoff-root --for handoff
```

Voiceover:

Instead of sending an entire project history, you can hand an AI agent the
specific node, boundary, references, and verification steps it needs.

### 38-50s: Viewer

Visual: local viewer with search and export controls.

Voiceover:

The viewer is local-first. Open a `.ontos` file, search nodes, review fields,
and export to Markdown, HTML, JSON, or OPML.

### 50-60s: Close

Visual: README title and install command.

Voiceover:

`.ontos Protocol` is MIT licensed, plain text, and built for AI-native project
context. Try it with `npm install -g @ontos-protocol/cli`.

## Capture Checklist

- [ ] Show `.ontos Protocol` as the project title.
- [ ] Show `ontosfmt` as the CLI.
- [ ] Show repository name `ontos-protocol`.
- [ ] Show `.ontos` as the extension.
- [ ] Avoid unrelated product names or private project context.
- [ ] Keep all terminal commands reproducible from the public repository.
- [ ] Run `npm run demo:video`.
- [ ] Run `npm run validate:demo-video`.
- [ ] Review `.release/ontos-protocol-60s-demo.mp4` before public posting.
