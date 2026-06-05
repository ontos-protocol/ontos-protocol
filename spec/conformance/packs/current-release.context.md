# .ontos context pack

document: Project state example
node: current-release
path: Current release

## Fields

### status

active

### purpose

Track the formal open-source release.

### current

Format specification is being prepared.
Parser and CLI work are planned.

### risk

Do not publish before conformance fixtures are complete.

### verify

Run ontosfmt validate examples.
Run exporter snapshot tests.

## Node Text

```text
- Current release @id(current-release) #release
  status: active
  purpose: Track the formal open-source release.
  current:
    - Format specification is being prepared.
    - Parser and CLI work are planned.
  risk:
    - Do not publish before conformance fixtures are complete.
  verify:
    - Run ontosfmt validate examples.
    - Run exporter snapshot tests.

  - Parser package @id(parser-package) #package
    status: planned
    purpose: Parse .ontos files into the canonical AST.
    acceptance:
      - Valid fixtures parse successfully.
      - Invalid fixtures produce expected diagnostics.

  - CLI package @id(cli-package) #package
    status: planned
    purpose: Provide validation, formatting, export, import, and pack commands.
    verify:
      - ontosfmt --help prints command list.
      - ontosfmt validate exits with documented codes.
```
