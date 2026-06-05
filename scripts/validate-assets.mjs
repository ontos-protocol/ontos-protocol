import { readFileSync, statSync } from "node:fs";

const assets = [
  {
    file: "website/src/assets/viewer-screenshot.svg",
    required: [".ontos Protocol viewer", "width=\"1200\"", "height=\"760\""]
  },
  {
    file: "website/src/assets/cli-screenshot.svg",
    required: ["ontosfmt CLI", "width=\"1200\"", "height=\"720\""]
  },
  {
    file: "website/src/assets/social-preview.svg",
    required: [".ontos Protocol social preview", "width=\"1200\"", "height=\"630\""]
  }
];

for (const asset of assets) {
  const stat = statSync(asset.file, { throwIfNoEntry: false });
  if (!stat || stat.size < 1000) {
    throw new Error(`${asset.file} is missing or unexpectedly small.`);
  }
  const text = readFileSync(asset.file, "utf8");
  if (!text.trimStart().startsWith("<svg")) {
    throw new Error(`${asset.file} is not an SVG asset.`);
  }
  for (const required of asset.required) {
    if (!text.includes(required)) {
      throw new Error(`${asset.file} is missing ${required}.`);
    }
  }
}

console.log(`validated ${assets.length} launch assets`);
