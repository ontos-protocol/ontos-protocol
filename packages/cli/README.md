# @ontos-protocol/cli

Command-line tools for `.ontos Protocol`.

Executable:

```bash
ontosfmt
```

## Commands

```bash
ontosfmt --help
ontosfmt --version
ontosfmt validate file.ontos
ontosfmt validate file.ontos --json
ontosfmt validate "examples/*.ontos" --quiet
ontosfmt validate file.ontos --ci
ontosfmt validate file.ontos --strict-ids --recommended --check-formatting
ontosfmt validate file.ontos --deprecated-fields old_field:purpose
ontosfmt parse file.ontos
ontosfmt format file.ontos
ontosfmt format --check file.ontos
ontosfmt format --write file.ontos
ontosfmt format --diff file.ontos
cat file.ontos | ontosfmt format -
ontosfmt export file.ontos --to md
ontosfmt export file.ontos --to md --front-matter --toc --heading-offset 1
ontosfmt export file.ontos --to html
ontosfmt export file.ontos --to html --search-index
ontosfmt export file.ontos --to json
ontosfmt export file.ontos --to json --include-diagnostics --include-source
ontosfmt export file.ontos --to opml
ontosfmt export file.ontos --to opml --opml-fields purpose,status
ontosfmt convert README.md --to .ontos
ontosfmt convert README.md --to .ontos --report
ontosfmt convert outline.opml --to .ontos
ontosfmt inspect file.ontos --node node-id
ontosfmt list nodes file.ontos
ontosfmt list fields file.ontos
ontosfmt stats file.ontos
ontosfmt pack file.ontos --node node-id --for context
ontosfmt pack file.ontos --node node-id --for review --json
ontosfmt pack file.ontos --node node-id --for verification --token-budget 1200
ontosfmt pack file.ontos --node node-id --for modify-boundary
ontosfmt schema
ontosfmt doctor
```

Supported pack kinds:

- `context`
- `review`
- `handoff`
- `modify-boundary`
- `verification`

Pack output includes selected fields, selected node text, linked bracket
references, source-like file or URL references, and optional token budget
metadata.

## Exit Codes

- `0`: command completed successfully
- `1`: validation or formatting check failed
- `2`: command usage or runtime failure

## Local-First Behavior

`ontosfmt` reads local files and writes only when an explicit write command is
used, such as `format --write`.
