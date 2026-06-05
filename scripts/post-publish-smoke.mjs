import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import {
  mkdtempSync,
  rmSync,
  writeFileSync
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const version = process.env.ONTOS_RELEASE_VERSION ?? "1.0.0";
const packages = [
  "@ontos-protocol/schema",
  "@ontos-protocol/parser",
  "@ontos-protocol/viewer",
  "@ontos-protocol/cli"
];
const temp = mkdtempSync(join(tmpdir(), "ontos-post-publish-"));

try {
  for (const name of packages) {
    const publishedVersion = run("npm", ["view", `${name}@${version}`, "version"]);
    assert.equal(publishedVersion.trim(), version, `${name} should be published at ${version}`);
  }

  run("npm", ["init", "-y"], { cwd: temp });
  run("npm", ["install", ...packages.map((name) => `${name}@${version}`)], { cwd: temp });

  const cliVersion = run("npx", ["ontosfmt", "--version"], { cwd: temp }).trim();
  assert.equal(cliVersion, version, "ontosfmt version should match release version");

  const doctor = run("npx", ["ontosfmt", "doctor"], { cwd: temp });
  assert.match(doctor, /status ok/u, "ontosfmt doctor should report status ok");

  const sample = join(temp, "sample.ontos");
  writeFileSync(
    sample,
    `@ontos 1.0
@title Post Publish Smoke

- Root @id(root)
  purpose: Verify published package install.
`,
    "utf8"
  );
  const validation = run("npx", ["ontosfmt", "validate", sample], { cwd: temp });
  assert.match(validation, /sample\.ontos: ok/u, "published CLI should validate sample file");

  console.log("post-publish smoke ok");
} finally {
  rmSync(temp, { recursive: true, force: true });
}

function run(command, args, options = {}) {
  return execFileSync(command, args, {
    cwd: options.cwd,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
    env: {
      ...process.env,
      npm_config_update_notifier: "false"
    }
  });
}
