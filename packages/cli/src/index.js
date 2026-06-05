#!/usr/bin/env node
import { readdirSync, readFileSync, realpathSync, statSync, writeFileSync } from "node:fs";
import { basename, extname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { astSchema, ONTOS_FORMAT_VERSION } from "@ontos-protocol/schema";
import { exportHtml, exportJson, exportMarkdown, exportOpml } from "./exporters.js";
import { convertMarkdownToOntosResult, convertOpmlToOntos } from "./importers.js";
import { createNodePack, exportPackMarkdown } from "./packs.js";
import {
  findNodeById,
  formatOntosDocument,
  getNodePath,
  getNodeText,
  OntosParseError,
  parseOntosDocument,
  serializeOntosDocument,
  validateOntosDocument,
  walkNodes
} from "@ontos-protocol/parser";

const VERSION = "1.0.0";

export async function main(argv = process.argv.slice(2), io = defaultIo()) {
  try {
    const result = run(argv, io);
    if (typeof result === "number") {
      return result;
    }
    return 0;
  } catch (error) {
    io.err(`${error.message}\n`);
    return 2;
  }
}

export function run(argv, io = defaultIo()) {
  const [command, ...args] = argv;

  if (!command || command === "--help" || command === "-h") {
    io.out(helpText());
    return 0;
  }

  if (command === "--version" || command === "-v") {
    io.out(`${VERSION}\n`);
    return 0;
  }

  switch (command) {
    case "parse":
      return parseCommand(args, io);
    case "validate":
      return validateCommand(args, io);
    case "format":
      return formatCommand(args, io);
    case "export":
      return exportCommand(args, io);
    case "convert":
      return convertCommand(args, io);
    case "inspect":
      return inspectCommand(args, io);
    case "list":
      return listCommand(args, io);
    case "stats":
      return statsCommand(args, io);
    case "pack":
      return packCommand(args, io);
    case "schema":
      io.out(`${JSON.stringify(astSchema, null, 2)}\n`);
      return 0;
    case "doctor":
      io.out(`ontosfmt ${VERSION}\n.ontos format ${ONTOS_FORMAT_VERSION}\nstatus ok\n`);
      return 0;
    default:
      throw new Error(`Unknown command: ${command}`);
  }
}

function parseCommand(args, io) {
  const file = requireFile(args);
  const ast = parseOntosDocument(read(file, io), { preserveComments: hasFlag(args, "--comments") });
  io.out(`${JSON.stringify(ast, null, 2)}\n`);
  return hasErrors(ast.diagnostics) ? 1 : 0;
}

function validateCommand(args, io) {
  const files = requireFiles(args);
  const validateOptions = validationOptions(args);
  const entries = files.map((file) => ({
    file,
    diagnostics: validateOntosDocument(read(file, io), validateOptions)
  }));

  if (hasFlag(args, "--json")) {
    io.out(`${JSON.stringify(entries.length === 1 ? entries[0].diagnostics : entries, null, 2)}\n`);
  } else if (hasFlag(args, "--ci")) {
    for (const entry of entries) {
      for (const diagnostic of entry.diagnostics) {
        io.out(formatCiDiagnostic(entry.file, diagnostic));
      }
    }
  } else {
    for (const entry of entries) {
      if (entry.diagnostics.length === 0) {
        if (!hasFlag(args, "--quiet")) {
          io.out(`${entry.file}: ok\n`);
        }
      } else {
        for (const diagnostic of entry.diagnostics) {
          io.out(formatDiagnostic(entry.file, diagnostic, args));
        }
      }
    }
  }
  if (hasFlag(args, "--verbose") && !hasFlag(args, "--quiet") && !hasFlag(args, "--json")) {
    const fileCount = entries.length;
    const diagnosticCount = entries.reduce((sum, entry) => sum + entry.diagnostics.length, 0);
    io.out(`${fileCount} file${fileCount === 1 ? "" : "s"}, ${diagnosticCount} diagnostic${diagnosticCount === 1 ? "" : "s"}\n`);
  }
  return entries.some((entry) => hasErrors(entry.diagnostics)) ? 1 : 0;
}

function validationOptions(args) {
  return {
    requireNodeIds: hasFlag(args, "--strict-ids"),
    checkRecommendedFields: hasFlag(args, "--recommended"),
    checkFormatting: hasFlag(args, "--check-formatting"),
    deprecatedFields: Object.fromEntries(
      csvOption(args, "--deprecated-fields").map((item) => {
        const [field, replacement = ""] = item.split(":");
        return [field, replacement || null];
      })
    )
  };
}

function formatCommand(args, io) {
  const files = requireFiles(args);
  const check = hasFlag(args, "--check");
  const write = hasFlag(args, "--write");
  const diff = hasFlag(args, "--diff");
  if (files.length > 1 && !check && !write && !diff) {
    throw new Error("Formatting multiple files requires --check, --write, or --diff.");
  }

  let changed = false;
  const results = [];
  for (const file of files) {
    const input = read(file, io);
    try {
      const formatted = formatOntosDocument(input);
      results.push({
        file,
        input,
        formatted,
        isChanged: input !== formatted
      });
    } catch (error) {
      if (!(error instanceof OntosParseError)) {
        throw error;
      }
      results.push({
        file,
        input,
        error
      });
    }
  }

  const invalidResults = results.filter((entry) => entry.error);
  if (invalidResults.length > 0) {
    if (!hasFlag(args, "--quiet")) {
      for (const entry of invalidResults) {
        for (const diagnostic of entry.error.diagnostics ?? []) {
          io.out(formatDiagnostic(entry.file, diagnostic, args));
        }
      }
    }
    return 1;
  }

  for (const entry of results) {
    const { file, input, formatted, isChanged } = entry;
    changed = changed || isChanged;

    if (check) {
      if (!hasFlag(args, "--quiet")) {
        io.out(`${file}: ${isChanged ? "needs formatting" : "formatted"}\n`);
      }
      continue;
    }

    if (diff) {
      if (isChanged) {
        io.out(formatDiff(file, input, formatted));
      } else if (hasFlag(args, "--verbose") && !hasFlag(args, "--quiet")) {
        io.out(`${file}: no changes\n`);
      }
      continue;
    }

    if (write) {
      if (file === "-") {
        throw new Error("Cannot write formatted stdin.");
      }
      if (isChanged) {
        writeFileSync(file, formatted, "utf8");
      }
      if (!hasFlag(args, "--quiet")) {
        io.out(`${file}: written\n`);
      }
      continue;
    }

    io.out(formatted);
  }

  return changed && (check || diff) ? 1 : 0;
}

function exportCommand(args, io) {
  const file = requireFile(args);
  const target = optionValue(args, "--to") ?? "json";
  const ast = parseOntosDocument(read(file, io), {
    includeDiagnostics: hasFlag(args, "--include-diagnostics"),
    includeSourceLocations: hasFlag(args, "--include-source")
  });

  switch (target) {
    case "json":
      io.out(exportJson(ast));
      return 0;
    case "md":
    case "markdown":
      io.out(
        exportMarkdown(ast, {
          frontMatter: hasFlag(args, "--front-matter"),
          toc: hasFlag(args, "--toc"),
          headingOffset: integerOption(args, "--heading-offset") ?? 0
        })
      );
      return 0;
    case "html":
      io.out(exportHtml(ast, { searchIndex: hasFlag(args, "--search-index") }));
      return 0;
    case "opml":
      io.out(exportOpml(ast, { fields: csvOption(args, "--opml-fields") }));
      return 0;
    default:
      throw new Error(`Unsupported export target: ${target}`);
  }
}

function convertCommand(args, io) {
  const file = requireFile(args);
  const target = optionValue(args, "--to") ?? ".ontos";
  if (target !== ".ontos") {
    throw new Error(`Unsupported convert target: ${target}`);
  }
  const input = read(file);
  const fallbackTitle = basename(file, extname(file));
  switch (extname(file).toLowerCase()) {
    case ".md":
    case ".markdown":
      {
        const result = convertMarkdownToOntosResult(input, fallbackTitle);
        io.out(result.document);
        if (hasFlag(args, "--report")) {
          io.err(`${JSON.stringify(result.report, null, 2)}\n`);
        }
      }
      return 0;
    case ".opml":
      io.out(convertOpmlToOntos(input, fallbackTitle));
      return 0;
    default:
      throw new Error(`Unsupported convert source: ${extname(file) || "unknown"}`);
  }
}

function inspectCommand(args, io) {
  const file = requireFile(args);
  const nodeId = optionValue(args, "--node");
  if (!nodeId) {
    throw new Error("inspect requires --node <id>.");
  }
  const ast = parseOntosDocument(read(file, io), { includeDiagnostics: false });
  const node = findNodeById(ast, nodeId);
  if (!node) {
    throw new Error(`Node not found: ${nodeId}`);
  }
  io.out(`path: ${getNodePath(ast, nodeId).join(" > ")}\n\n`);
  io.out(getNodeText(ast, nodeId));
  return 0;
}

function listCommand(args, io) {
  const [kind, ...rest] = args;
  const file = requireFile(rest);
  const ast = parseOntosDocument(read(file, io), { includeDiagnostics: false });

  if (kind === "nodes") {
    walkNodes(ast, (node) => {
      io.out(`${node.id ?? "-"}\t${node.title}\n`);
    });
    return 0;
  }

  if (kind === "fields") {
    const fields = new Set();
    walkNodes(ast, (node) => {
      for (const key of Object.keys(node.fields ?? {})) {
        fields.add(key);
      }
    });
    io.out(`${[...fields].sort().join("\n")}\n`);
    return 0;
  }

  throw new Error("list requires 'nodes' or 'fields'.");
}

function statsCommand(args, io) {
  const file = requireFile(args);
  const ast = parseOntosDocument(read(file, io), { includeDiagnostics: false });
  let nodeCount = 0;
  const fields = new Set();
  walkNodes(ast, (node) => {
    nodeCount += 1;
    for (const key of Object.keys(node.fields ?? {})) {
      fields.add(key);
    }
  });
  io.out(
    `${JSON.stringify(
      {
        title: ast.metadata.title,
        nodes: nodeCount,
        fields: fields.size
      },
      null,
      2
    )}\n`
  );
  return 0;
}

function packCommand(args, io) {
  const file = requireFile(args);
  const nodeId = optionValue(args, "--node");
  const packFor = optionValue(args, "--for") ?? "context";
  const tokenBudget = integerOption(args, "--token-budget");
  const json = hasFlag(args, "--json");
  if (!nodeId) {
    throw new Error("pack requires --node <id>.");
  }
  const ast = parseOntosDocument(read(file, io), { includeDiagnostics: false });
  const pack = createNodePack(ast, nodeId, packFor, { tokenBudget });

  if (json) {
    io.out(`${JSON.stringify(pack, null, 2)}\n`);
  } else {
    io.out(exportPackMarkdown(pack));
  }
  return 0;
}

function formatDiagnostic(file, diagnostic, args = []) {
  const pos = diagnostic.source?.start;
  const location = pos ? `${file}:${pos.line}:${pos.column}` : file;
  const severity = colorSeverity(diagnostic.severity, args);
  return `${location} ${severity} ${diagnostic.code} ${diagnostic.message}\n`;
}

function formatCiDiagnostic(file, diagnostic) {
  const pos = diagnostic.source?.start;
  const severity = diagnostic.severity === "error" ? "error" : "warning";
  const props = [
    `file=${escapeCi(file)}`,
    pos ? `line=${pos.line}` : "",
    pos ? `col=${pos.column}` : ""
  ].filter(Boolean).join(",");
  return `::${severity} ${props}::${escapeCi(`${diagnostic.code}: ${diagnostic.message}`)}\n`;
}

function requireFile(args) {
  const file = fileArgs(args)[0];
  if (!file) {
    throw new Error("Missing file argument.");
  }
  return file;
}

function requireFiles(args) {
  const files = expandFileArgs(fileArgs(args));
  if (files.length === 0) {
    throw new Error("Missing file argument.");
  }
  return files;
}

function fileArgs(args) {
  return args.filter((arg) => (arg === "-" || !arg.startsWith("-")) && !isOptionValue(args, arg));
}

function optionValue(args, name) {
  const index = args.indexOf(name);
  return index >= 0 ? args[index + 1] : undefined;
}

function integerOption(args, name) {
  const value = optionValue(args, name);
  if (value === undefined) {
    return undefined;
  }
  const number = Number(value);
  if (!Number.isInteger(number) || number <= 0) {
    throw new Error(`${name} must be a positive integer.`);
  }
  return number;
}

function csvOption(args, name) {
  const value = optionValue(args, name);
  return value === undefined
    ? []
    : value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
}

function hasFlag(args, name) {
  return args.includes(name);
}

function isOptionValue(args, arg) {
  const index = args.indexOf(arg);
  const valueOptions = new Set([
    "--to",
    "--node",
    "--for",
    "--token-budget",
    "--heading-offset",
    "--opml-fields",
    "--deprecated-fields"
  ]);
  return index > 0 && valueOptions.has(args[index - 1]);
}

function read(file, io = defaultIo()) {
  if (file === "-") {
    if (typeof io.stdin === "string") {
      return io.stdin;
    }
    return readFileSync(0, "utf8");
  }
  return readFileSync(file, "utf8");
}

function expandFileArgs(files) {
  const expanded = [];
  for (const file of files) {
    if (file === "-") {
      expanded.push(file);
      continue;
    }
    if (hasGlob(file)) {
      expanded.push(...expandGlob(file));
    } else {
      expanded.push(file);
    }
  }
  return [...new Set(expanded)].sort();
}

function hasGlob(value) {
  return /[*?]/.test(value);
}

function expandGlob(pattern) {
  const base = globBase(pattern);
  const regex = globRegex(pattern);
  const matches = [];
  walkFiles(base, (file) => {
    const normalized = normalizePath(file);
    if (regex.test(normalized)) {
      matches.push(normalized);
    }
  });
  return matches.length > 0 ? matches.sort() : [pattern];
}

function globBase(pattern) {
  const parts = normalizePath(pattern).split("/");
  const base = [];
  for (const part of parts) {
    if (hasGlob(part)) {
      break;
    }
    base.push(part);
  }
  return base.length === 0 ? "." : base.join("/");
}

function walkFiles(dir, visitor) {
  const stat = statSync(dir, { throwIfNoEntry: false });
  if (!stat) {
    return;
  }
  if (stat.isFile()) {
    visitor(dir);
    return;
  }
  for (const entry of readdirSync(dir)) {
    if (entry === "node_modules" || entry === ".git") {
      continue;
    }
    walkFiles(join(dir, entry), visitor);
  }
}

function globRegex(pattern) {
  let output = "^";
  const value = normalizePath(pattern);
  for (let index = 0; index < value.length; index += 1) {
    const char = value[index];
    if (char === "*") {
      if (value[index + 1] === "*") {
        output += ".*";
        index += 1;
      } else {
        output += "[^/]*";
      }
    } else if (char === "?") {
      output += "[^/]";
    } else {
      output += escapeRegex(char);
    }
  }
  return new RegExp(`${output}$`);
}

function normalizePath(value) {
  return value.replaceAll("\\", "/");
}

function escapeRegex(value) {
  return value.replace(/[|\\{}()[\]^$+*?.]/g, "\\$&");
}

function formatDiff(file, input, formatted) {
  const original = textLines(input);
  const next = textLines(formatted);
  const lines = [`--- ${file}`, `+++ ${file}`, "@@ -1 +1 @@"];
  for (const line of original) {
    lines.push(`-${line}`);
  }
  for (const line of next) {
    lines.push(`+${line}`);
  }
  return `${lines.join("\n")}\n`;
}

function textLines(value) {
  const lines = value.split("\n");
  if (lines.at(-1) === "") {
    lines.pop();
  }
  return lines;
}

function colorSeverity(severity, args) {
  if (!hasFlag(args, "--color") || hasFlag(args, "--no-color") || hasFlag(args, "--ci")) {
    return severity;
  }
  if (severity === "error") {
    return `\u001b[31m${severity}\u001b[0m`;
  }
  if (severity === "warning") {
    return `\u001b[33m${severity}\u001b[0m`;
  }
  return severity;
}

function escapeCi(value) {
  return String(value)
    .replaceAll("%", "%25")
    .replaceAll("\r", "%0D")
    .replaceAll("\n", "%0A")
    .replaceAll(":", "%3A")
    .replaceAll(",", "%2C");
}

function hasErrors(diagnostics = []) {
  return diagnostics.some((diagnostic) => diagnostic.severity === "error");
}

function helpText() {
  return `ontosfmt ${VERSION}

Usage:
  ontosfmt <command> [options]

Commands:
  parse <file>                     Print AST JSON
  validate <file...> [--json|--ci]  Validate .ontos files
  validate <file...> --strict-ids --recommended --check-formatting
  validate <file...> --deprecated-fields old_field:purpose
  format <file...> [--check|--write|--diff]
                                    Format .ontos files
  export <file> --to <target>       Export to md, html, json, or opml
  export <file> --to md --front-matter --toc --heading-offset 1
  export <file> --to html --search-index
  export <file> --to json --include-diagnostics --include-source
  export <file> --to opml --opml-fields purpose,status
  convert <file.md|file.opml> --to .ontos [--report]
                                    Convert Markdown or OPML to .ontos
  inspect <file> --node <id>        Print one node
  list nodes <file>                 List node IDs and titles
  list fields <file>                List field names
  stats <file>                      Print document stats
  pack <file> --node <id>           Generate AI context pack
  pack <file> --node <id> --for verification --token-budget 1200
  schema                            Print AST JSON Schema
  doctor                            Print environment status

Global options:
  -                                  Read stdin where a file is accepted
  --quiet                            Suppress success output
  --verbose                          Print extra summary output
  --color, --no-color                Control diagnostic color
  --ci                               Print GitHub Actions annotations
`;
}

function defaultIo() {
  return {
    out: (value) => process.stdout.write(value),
    err: (value) => process.stderr.write(value)
  };
}

if (
  process.argv[1] &&
  realpathSync(fileURLToPath(import.meta.url)) === realpathSync(process.argv[1])
) {
  const code = await main();
  process.exitCode = code;
}
