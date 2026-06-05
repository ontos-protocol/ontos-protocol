import { existsSync, mkdtempSync, readFileSync, readdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { spawnSync } from "node:child_process";

const coverageDir = mkdtempSync(join(tmpdir(), "ontos-coverage-"));
const commands = [
  ["node", ["packages/parser/test/conformance.test.js"]],
  ["node", ["packages/schema/test/schema.test.js"]],
  ["node", ["packages/cli/test/cli.test.js"]],
  ["node", ["packages/viewer/test/viewer.test.js"]],
  ["node", ["scripts/viewer-browser-smoke.mjs"]]
];

try {
  for (const [command, args] of commands) {
    const result = spawnSync(command, args, {
      env: { ...process.env, NODE_V8_COVERAGE: coverageDir },
      encoding: "utf8",
      stdio: "pipe"
    });
    if (result.status !== 0) {
      process.stdout.write(result.stdout);
      process.stderr.write(result.stderr);
      throw new Error(`coverage command failed: ${command} ${args.join(" ")}`);
    }
  }

  const files = sourceFiles();
  const coverage = readCoverage(files);
  const rows = [];
  let coveredBytes = 0;
  let totalBytes = 0;

  for (const file of files) {
    const source = readFileSync(file, "utf8");
    const covered = coverage.get(file) ?? new Uint8Array(source.length);
    const coveredCount = covered.reduce((sum, value) => sum + value, 0);
    coveredBytes += coveredCount;
    totalBytes += source.length;
    rows.push({
      file,
      percent: source.length === 0 ? 100 : (coveredCount / source.length) * 100
    });
  }

  const totalPercent = totalBytes === 0 ? 100 : (coveredBytes / totalBytes) * 100;
  const minimumTotal = 65;
  const minimumFile = 35;
  const lowFiles = rows.filter((row) => row.percent < minimumFile);

  if (totalPercent < minimumTotal || lowFiles.length > 0) {
    for (const row of rows) {
      console.error(`${displayPath(row.file)} ${row.percent.toFixed(1)}%`);
    }
    if (lowFiles.length > 0) {
      throw new Error(
        `coverage below ${minimumFile}% for ${lowFiles.map((row) => displayPath(row.file)).join(", ")}`
      );
    }
    throw new Error(`coverage total ${totalPercent.toFixed(1)}% is below ${minimumTotal}%.`);
  }

  console.log(`coverage ok total=${totalPercent.toFixed(1)}% files=${rows.length}`);
} finally {
  rmSync(coverageDir, { recursive: true, force: true });
}

function sourceFiles() {
  const dirs = [
    "packages/parser/src",
    "packages/cli/src",
    "packages/schema/src",
    "packages/viewer/src"
  ];
  return dirs
    .flatMap((dir) =>
      readdirSync(dir)
        .filter((file) => file.endsWith(".js"))
        .map((file) => resolve(dir, file))
    )
    .filter((file) => existsSync(file))
    .sort();
}

function readCoverage(files) {
  const wanted = new Map(files.map((file) => [pathToFileURL(file).href, file]));
  const coverage = new Map(files.map((file) => [file, new Uint8Array(readFileSync(file, "utf8").length)]));

  for (const file of readdirSync(coverageDir).filter((name) => name.endsWith(".json"))) {
    const report = JSON.parse(readFileSync(join(coverageDir, file), "utf8"));
    for (const entry of report.result ?? []) {
      const target = wanted.get(entry.url);
      if (!target) {
        continue;
      }
      const marks = coverage.get(target);
      const sourceLength = marks.length;
      const functions = entry.functions ?? [];
      const onlyModuleScope =
        functions.length === 1 &&
        functions[0].functionName === "" &&
        functions[0].ranges?.length === 1 &&
        functions[0].ranges[0].startOffset === 0 &&
        functions[0].ranges[0].endOffset >= sourceLength;
      for (const fn of functions) {
        for (const range of fn.ranges ?? []) {
          if (range.count <= 0) {
            continue;
          }
          if (!onlyModuleScope && range.startOffset === 0 && range.endOffset >= sourceLength && fn.functionName === "") {
            continue;
          }
          for (let index = range.startOffset; index < Math.min(range.endOffset, sourceLength); index += 1) {
            marks[index] = 1;
          }
        }
      }
    }
  }

  return coverage;
}

function displayPath(file) {
  return fileURLToPath(pathToFileURL(file)).replace(`${resolve(".")}/`, "");
}
