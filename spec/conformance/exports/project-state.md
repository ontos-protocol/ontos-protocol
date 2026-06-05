# Project state example

## Current release {#current-release}

Tags: #release

**status:**

active

**purpose:**

Track the formal open-source release.

**current:**

- Format specification is being prepared.
- Parser and CLI work are planned.

**risk:**

- Do not publish before conformance fixtures are complete.

**verify:**

- Run ontosfmt validate examples.
- Run exporter snapshot tests.

### Parser package {#parser-package}

Tags: #package

**status:**

planned

**purpose:**

Parse .ontos files into the canonical AST.

**acceptance:**

- Valid fixtures parse successfully.
- Invalid fixtures produce expected diagnostics.

### CLI package {#cli-package}

Tags: #package

**status:**

planned

**purpose:**

Provide validation, formatting, export, import, and pack commands.

**verify:**

- ontosfmt --help prints command list.
- ontosfmt validate exits with documented codes.

