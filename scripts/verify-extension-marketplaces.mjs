import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const manifest = JSON.parse(readFileSync("extensions/vscode/package.json", "utf8"));
const publisher = manifest.publisher;
const extension = manifest.name;
const expectedVersion = process.env.ONTOS_EXTENSION_VERSION ?? manifest.version;
const itemName = `${publisher}.${extension}`;
const releaseTag = `v${expectedVersion}`;
const repository = "ontos-protocol/ontos-protocol";
const vsixName = `ontos-protocol-vscode-${expectedVersion}.vsix`;

const [marketplace, openVsx, githubRelease] = await Promise.all([
  fetchMarketplace(),
  fetchOpenVsx(),
  fetchGithubRelease()
]);

assert.equal(marketplace.latestVersion, expectedVersion, "Visual Studio Marketplace latest version");
assert.equal(openVsx.version, expectedVersion, "Open VSX latest version");
assert.equal(openVsx.downloadable, true, "Open VSX extension should be downloadable");
assert.equal(openVsx.verified, true, "Open VSX namespace should be verified");
assert.equal(openVsx.unrelatedPublisher, false, "Open VSX publisher should be related to the namespace");
assert.ok(githubRelease.assets.includes(vsixName), `GitHub release should include ${vsixName}`);
assert.ok(githubRelease.assets.includes("SHA256SUMS"), "GitHub release should include SHA256SUMS");

console.log(JSON.stringify({
  itemName,
  expectedVersion,
  marketplace,
  openVsx: {
    version: openVsx.version,
    downloadable: openVsx.downloadable,
    verified: openVsx.verified,
    unrelatedPublisher: openVsx.unrelatedPublisher
  },
  githubRelease
}, null, 2));

async function fetchMarketplace() {
  const response = await fetch("https://marketplace.visualstudio.com/_apis/public/gallery/extensionquery?api-version=7.2-preview.1", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      accept: "application/json;api-version=7.2-preview.1"
    },
    body: JSON.stringify({
      filters: [
        {
          criteria: [
            {
              filterType: 7,
              value: itemName
            }
          ]
        }
      ],
      flags: 914
    })
  });
  assert.equal(response.ok, true, `Marketplace query failed: ${response.status}`);
  const body = await response.json();
  const extensionResult = body.results?.[0]?.extensions?.[0];
  assert.ok(extensionResult, `Marketplace extension not found: ${itemName}`);
  const latestVersion = extensionResult.versions?.[0]?.version;
  assert.ok(latestVersion, "Marketplace response missing latest version");
  return {
    latestVersion,
    url: `https://marketplace.visualstudio.com/items?itemName=${itemName}`
  };
}

async function fetchOpenVsx() {
  const response = await fetch(`https://open-vsx.org/api/${publisher}/${extension}/latest`, {
    headers: {
      accept: "application/json"
    }
  });
  assert.equal(response.ok, true, `Open VSX query failed: ${response.status}`);
  return await response.json();
}

async function fetchGithubRelease() {
  const response = await fetch(`https://api.github.com/repos/${repository}/releases/tags/${releaseTag}`, {
    headers: {
      accept: "application/vnd.github+json",
      "user-agent": "ontos-protocol-release-verifier"
    }
  });
  assert.equal(response.ok, true, `GitHub release query failed: ${response.status}`);
  const body = await response.json();
  return {
    tagName: body.tag_name,
    url: body.html_url,
    assets: body.assets.map((asset) => asset.name)
  };
}
