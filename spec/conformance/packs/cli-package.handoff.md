# .ontos handoff pack

document: Project state example
node: cli-package
path: Current release > CLI package

## Fields

### status

planned

### purpose

Provide validation, formatting, export, import, and pack commands.

### verify

ontosfmt --help prints command list.
ontosfmt validate exits with documented codes.

## Node Text

```text
- CLI package @id(cli-package) #package
  status: planned
  purpose: Provide validation, formatting, export, import, and pack commands.
  verify:
    - ontosfmt --help prints command list.
    - ontosfmt validate exits with documented codes.
```
