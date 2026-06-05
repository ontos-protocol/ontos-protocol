import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const npmCacheDir = mkdtempSync(join(tmpdir(), "ontos-publish-cache-"));
const packages = [
  "@ontos-protocol/schema",
  "@ontos-protocol/parser",
  "@ontos-protocol/viewer",
  "@ontos-protocol/cli"
];

try {
  for (const workspace of packages) {
    execFileSync("npm", ["publish", "--dry-run", "--offline", "--access", "public", "-w", workspace], {
      cwd: root,
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
} finally {
  rmSync(npmCacheDir, { recursive: true, force: true });
}

console.log("publish dry run ok");
