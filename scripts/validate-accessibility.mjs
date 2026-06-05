import { existsSync, readFileSync } from "node:fs";
import { JSDOM } from "jsdom";

const requiredFiles = [
  "website/dist/index.html",
  "website/dist/styles.css",
  "website/dist/app.js",
  "website/dist/assets/viewer-screenshot.svg",
  "website/dist/assets/cli-screenshot.svg",
  "website/dist/assets/social-preview.svg",
  "packages/viewer/src/index.js"
];

for (const file of requiredFiles) {
  if (!existsSync(file)) {
    throw new Error(`accessibility check requires ${file}; run the website build first.`);
  }
}

const html = readFileSync("website/dist/index.html", "utf8");
const styles = readFileSync("website/dist/styles.css", "utf8");
const app = readFileSync("website/dist/app.js", "utf8");
const viewer = readFileSync("packages/viewer/src/index.js", "utf8");
const document = new JSDOM(html).window.document;

if (!document.querySelector("main")) {
  throw new Error("website is missing a main landmark.");
}

if (!document.querySelector("nav[aria-label]")) {
  throw new Error("website navigation needs an aria-label.");
}

for (const section of document.querySelectorAll("section[id]")) {
  const labelledBy = section.getAttribute("aria-labelledby");
  if (!labelledBy || !document.getElementById(labelledBy)) {
    throw new Error(`section #${section.id} needs a valid aria-labelledby target.`);
  }
}

const search = document.querySelector("#examples-search");
if (!search || document.querySelector("label[for='examples-search']")?.textContent.trim() === "") {
  throw new Error("examples search input needs a visible label.");
}

let previousHeadingLevel = 0;
for (const heading of document.querySelectorAll("h1, h2, h3, h4, h5, h6")) {
  const level = Number(heading.tagName.slice(1));
  if (previousHeadingLevel > 0 && level > previousHeadingLevel + 1) {
    throw new Error(`heading level jumps from h${previousHeadingLevel} to h${level}: ${heading.textContent}`);
  }
  previousHeadingLevel = level;
}

for (const link of document.querySelectorAll("a")) {
  const text = link.textContent.trim();
  if (!text) {
    throw new Error(`link is missing accessible text: ${link.getAttribute("href")}`);
  }
  if (/^(click here|here|read more)$/iu.test(text)) {
    throw new Error(`link text is not descriptive enough: ${text}`);
  }
}

for (const image of document.querySelectorAll("img")) {
  const alt = image.getAttribute("alt")?.trim() ?? "";
  if (alt.length < 8) {
    throw new Error(`image needs useful alt text: ${image.getAttribute("src")}`);
  }
}

for (const pre of document.querySelectorAll("pre")) {
  if (!pre.querySelector("code")) {
    throw new Error("code block is missing a code element.");
  }
  if (!pre.closest("article")?.querySelector("h3") && !pre.closest("section")?.querySelector("h2")) {
    throw new Error("code block needs a nearby visible label.");
  }
}

for (const file of [
  "website/dist/assets/viewer-screenshot.svg",
  "website/dist/assets/cli-screenshot.svg",
  "website/dist/assets/social-preview.svg"
]) {
  const svg = readFileSync(file, "utf8");
  if (!svg.includes('role="img"') || !svg.includes("<title") || !svg.includes("<desc")) {
    throw new Error(`${file} needs image role, title, and description.`);
  }
}

for (const [label, source] of [
  ["website styles", styles],
  ["viewer styles", viewer]
]) {
  for (const required of [":focus-visible", "prefers-reduced-motion", "prefers-contrast"]) {
    if (!source.includes(required)) {
      throw new Error(`${label} is missing ${required}.`);
    }
  }
}

if (!styles.includes("@media (max-width: 820px)") || /font-size:\s*[^;]*vw/iu.test(styles)) {
  throw new Error("website styles need responsive layout without viewport-scaled font sizes.");
}

for (const required of [
  "aria-label",
  "role\", \"status\"",
  "role\", \"alert\"",
  "role\", \"tree\"",
  "role\", \"treeitem\"",
  "aria-expanded"
]) {
  if (!viewer.includes(required)) {
    throw new Error(`viewer source is missing accessibility marker: ${required}`);
  }
}

for (const required of ["Copy code block", "examples-search", "examples-empty"]) {
  if (!app.includes(required)) {
    throw new Error(`website app is missing accessible behavior marker: ${required}`);
  }
}

const cssVars = readCssVariables(styles);
assertContrast("body text", cssVars.ink, "#ffffff", 7);
assertContrast("muted text", cssVars.muted, "#ffffff", 4.5);
assertContrast("accent button text", cssVars["accent-ink"], cssVars.accent, 4.5);

console.log("accessibility static QA ok");

function readCssVariables(source) {
  const vars = {};
  for (const match of source.matchAll(/--([a-z-]+):\s*(#[0-9a-f]{6})/giu)) {
    vars[match[1]] = match[2];
  }
  return vars;
}

function assertContrast(label, foreground, background, minimum) {
  const ratio = contrastRatio(foreground, background);
  if (ratio < minimum) {
    throw new Error(`${label} contrast ${ratio.toFixed(2)} is below ${minimum}.`);
  }
}

function contrastRatio(foreground, background) {
  const light = Math.max(relativeLuminance(foreground), relativeLuminance(background));
  const dark = Math.min(relativeLuminance(foreground), relativeLuminance(background));
  return (light + 0.05) / (dark + 0.05);
}

function relativeLuminance(hex) {
  const [r, g, b] = hex
    .replace("#", "")
    .match(/.{2}/gu)
    .map((part) => parseInt(part, 16) / 255)
    .map((channel) =>
      channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4
    );
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
