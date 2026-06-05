import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const packDir = mkdtempSync(join(tmpdir(), "ontos-pack-"));
const installDir = mkdtempSync(join(tmpdir(), "ontos-install-"));
const npmCacheDir = mkdtempSync(join(tmpdir(), "ontos-npm-cache-"));
const repositoryUrl = "git+https://github.com/ontos-protocol/ontos-protocol.git";
const bugsUrl = "https://github.com/ontos-protocol/ontos-protocol/issues";
const packageDirectories = new Map([
  ["@ontos-protocol/schema", "packages/schema"],
  ["@ontos-protocol/parser", "packages/parser"],
  ["@ontos-protocol/cli", "packages/cli"],
  ["@ontos-protocol/viewer", "packages/viewer"]
]);

try {
  const runtimeTarballs = [
    packExternal("fast-xml-parser"),
    packExternal("@nodable/entities"),
    packExternal("fast-xml-builder"),
    packExternal("path-expression-matcher"),
    packExternal("strnum"),
    packExternal("xml-naming")
  ];
  const packed = [
    pack("@ontos-protocol/schema", ["package.json", "src/index.js", "src/index.d.ts", "src/ontos-ast.schema.json"]),
    pack("@ontos-protocol/parser", ["package.json", "src/index.js", "src/index.d.ts"]),
    pack("@ontos-protocol/cli", [
      "package.json",
      "src/index.js",
      "src/index.d.ts",
      "src/exporters.js",
      "src/exporters.d.ts",
      "src/importers.js",
      "src/importers.d.ts",
      "src/packs.js",
      "src/packs.d.ts"
    ]),
    pack("@ontos-protocol/viewer", ["package.json", "src/index.js", "src/index.d.ts"])
  ];
  const tarballs = packed.map((entry) => entry.tarball);

  writeFileSync(
    join(installDir, "package.json"),
    `${JSON.stringify({ private: true, type: "module" }, null, 2)}\n`,
    "utf8"
  );
  run("npm", ["install", "--ignore-scripts", "--offline", ...runtimeTarballs, ...tarballs], installDir);
  assertInstalledTypes("@ontos-protocol/schema");
  assertInstalledTypes("@ontos-protocol/parser");
  assertInstalledTypes("@ontos-protocol/cli");
  assertInstalledTypes("@ontos-protocol/viewer");

  run(
    process.execPath,
    [
      "--input-type=module",
      "--eval",
      [
        "import { ONTOS_FORMAT_VERSION } from '@ontos-protocol/schema';",
        "import { parseOntosDocument } from '@ontos-protocol/parser';",
        "import { createViewerModel } from '@ontos-protocol/viewer';",
        "const ast = parseOntosDocument('@ontos 1.0\\n@title Smoke\\n\\n- Root @id(root)\\n');",
        "const model = createViewerModel(ast);",
        "if (ONTOS_FORMAT_VERSION !== '1.0' || ast.metadata.title !== 'Smoke' || model.stats.nodes !== 1) process.exit(1);"
      ].join("\n")
    ],
    installDir
  );

  const sample = join(installDir, "sample.ontos");
  writeFileSync(sample, "@ontos 1.0\n@title Smoke\n\n- Root @id(root)\n", "utf8");
  const bin = join(
    installDir,
    "node_modules",
    ".bin",
    process.platform === "win32" ? "ontosfmt.cmd" : "ontosfmt"
  );
  const version = run(bin, ["--version"], installDir).trim();
  const validation = run(bin, ["validate", sample], installDir);
  if (version !== "1.0.0" || !validation.includes(": ok")) {
    throw new Error("Installed CLI smoke check failed.");
  }

  console.log("package smoke ok");
} finally {
  rmSync(packDir, { recursive: true, force: true });
  rmSync(installDir, { recursive: true, force: true });
  rmSync(npmCacheDir, { recursive: true, force: true });
}

function pack(workspace, requiredFiles) {
  const output = run("npm", ["pack", "--json", "-w", workspace, "--pack-destination", packDir], root);
  const [entry] = JSON.parse(output);
  assertPackManifest(workspace, entry, requiredFiles);
  return { tarball: join(packDir, entry.filename), manifest: entry };
}

function packExternal(packageName) {
  const packagePath = join(root, "node_modules", ...packageName.split("/"));
  const output = run("npm", ["pack", "--json", packagePath, "--pack-destination", packDir], root);
  const [entry] = JSON.parse(output);
  return join(packDir, entry.filename);
}

function assertPackManifest(workspace, manifest, requiredFiles) {
  const files = new Set(manifest.files.map((file) => file.path));
  for (const requiredFile of requiredFiles) {
    if (!files.has(requiredFile)) {
      throw new Error(`${workspace} package is missing ${requiredFile}.`);
    }
  }

  for (const file of files) {
    if (
      file.startsWith("test/") ||
      file.startsWith("spec/") ||
      file.startsWith(".github/") ||
      file.includes(".env")
    ) {
      throw new Error(`${workspace} package includes private or non-runtime file: ${file}.`);
    }
  }

  if (manifest.unpackedSize > 250_000) {
    throw new Error(`${workspace} package is larger than expected: ${manifest.unpackedSize} bytes.`);
  }
}

function assertInstalledTypes(packageName) {
  const packageJson = JSON.parse(
    readFileSync(join(installDir, "node_modules", ...packageName.split("/"), "package.json"), "utf8")
  );
  if (packageJson.types !== "./src/index.d.ts") {
    throw new Error(`${packageName} package does not expose ./src/index.d.ts.`);
  }
  if (packageJson.engines?.node !== ">=20.19") {
    throw new Error(`${packageName} package does not declare Node.js >=20.19.`);
  }
  assertPackageMetadata(packageName, packageJson);
}

function assertPackageMetadata(packageName, packageJson) {
  const directory = packageDirectories.get(packageName);
  if (packageJson.repository?.type !== "git" || packageJson.repository?.url !== repositoryUrl) {
    throw new Error(`${packageName} package does not expose the expected repository URL.`);
  }
  if (packageJson.repository?.directory !== directory) {
    throw new Error(`${packageName} package does not expose repository.directory ${directory}.`);
  }
  if (packageJson.bugs?.url !== bugsUrl) {
    throw new Error(`${packageName} package does not expose the expected issue URL.`);
  }
  if (!packageJson.homepage?.startsWith("https://github.com/ontos-protocol/ontos-protocol/tree/main/")) {
    throw new Error(`${packageName} package does not expose an expected package homepage.`);
  }
}

function run(command, args, cwd) {
  return execFileSync(command, args, {
    cwd,
    encoding: "utf8",
    env: {
      ...process.env,
      npm_config_audit: "false",
      npm_config_cache: npmCacheDir,
      npm_config_fund: "false",
      npm_config_update_notifier: "false"
    },
    stdio: ["ignore", "pipe", "pipe"]
  });
}
