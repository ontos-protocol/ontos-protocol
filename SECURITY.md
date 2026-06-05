# Security Policy

`.ontos Protocol` accepts private vulnerability reports for the current stable
release line and release-candidate work.

## Supported Versions

| Version | Supported |
| --- | --- |
| 1.x | Yes |
| < 1.0 | No |

## Reporting A Vulnerability

Please do not open a public issue for vulnerabilities that could affect users.

Until a public security email is created, report privately to the project
maintainers.

The public repository should keep private vulnerability reports enabled. The
repository also includes Dependabot configuration for npm and GitHub Actions
updates, plus CodeQL analysis for JavaScript surfaces.

Useful details:

- affected package or tool
- version or commit
- reproduction steps
- expected behavior
- actual behavior
- impact
- suggested fix, if known

## Security Scope

Security-sensitive areas include:

- parser behavior on untrusted files
- CLI file system operations
- HTML export escaping
- viewer file handling
- extension workspace permissions
- AI writeback tools that modify files

## Local File Writes

The CLI reads local files by default.

It writes only for explicit write commands such as:

```bash
ontosfmt format --write file.ontos
```

The CLI refuses to write formatted stdin. Export commands write to stdout unless
the user redirects output in their shell.

## Threat Model

The public threat model is documented in
[docs/THREAT_MODEL.md](docs/THREAT_MODEL.md).
