# Export Conformance

Export conformance fixtures will define expected output for:

- Markdown
- HTML
- JSON
- OPML

Required exporter behavior:

- output must be deterministic
- HTML and XML output must escape user content
- node hierarchy must be preserved
- node IDs should be preserved where the target format supports them
- custom fields should not be silently discarded

