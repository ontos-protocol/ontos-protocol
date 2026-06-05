import { existsSync, readFileSync } from "node:fs";
import { JSDOM } from "jsdom";

const indexPath = "website/dist/index.html";
const html = readFileSync(indexPath, "utf8");
const app = readFileSync("website/dist/app.js", "utf8");
const dom = new JSDOM(html);
const document = dom.window.document;

assertText("title", ".ontos Protocol");
assertMeta("meta[name='description']", "AI-native structured text protocol");
assertAttr("link[rel='canonical']", "href", "https://ontos-protocol.github.io/ontos-protocol/");
assertMeta("meta[property='og:url']", "https://ontos-protocol.github.io/ontos-protocol/");
assertMeta("meta[property='og:image']", "./assets/social-preview.svg");
assertMeta("meta[name='twitter:image']", "./assets/social-preview.svg");

for (const selector of [
  "#quickstart",
  "#demo",
  "#examples",
  "#examples-search",
  "#examples-empty",
  "#ai-pack",
  "#launch-assets",
  "#docs",
  "#docs-version"
]) {
  if (!document.querySelector(selector)) {
    throw new Error(`website is missing ${selector}.`);
  }
}

if (document.querySelectorAll(".docs-grid a").length < 12) {
  throw new Error("website docs grid does not include enough documentation links.");
}

for (const label of [
  "Why .ontos",
  "Format Guide",
  "Specification",
  "CLI Guide",
  "Parser API",
  "Viewer Guide",
  "AI Workflow Guide",
  "Agent Workflows",
  "Markdown Migration",
  "Templates",
  "VS Code Guide",
  "Obsidian Guide",
  "FAQ",
  "Governance",
  "Compatibility Policy",
  "Performance Limits",
  "Security",
  "Release Notes"
]) {
  if (![...document.querySelectorAll(".docs-grid a")].some((link) => link.textContent === label)) {
    throw new Error(`website docs grid is missing ${label}.`);
  }
}

for (const required of [
  "installCopyButtons",
  "copy-button",
  "examples-search",
  "renderExamples"
]) {
  if (!app.includes(required)) {
    throw new Error(`website app bundle is missing ${required}.`);
  }
}

assertText("#examples-empty", "No matching examples.");
if (document.querySelector("#docs-version")?.value !== "1.0.0") {
  throw new Error("docs version selector should default to 1.0.0.");
}

for (const link of document.querySelectorAll("nav a")) {
  const href = link.getAttribute("href");
  if (!href?.startsWith("#") || !document.querySelector(href)) {
    throw new Error(`navigation link has missing target: ${href}`);
  }
}

for (const img of document.querySelectorAll("img")) {
  const src = img.getAttribute("src");
  const alt = img.getAttribute("alt");
  if (!src || !existsSync(`website/dist/${src.replace(/^\.\//u, "")}`)) {
    throw new Error(`website image is missing from dist: ${src}`);
  }
  if (!alt || alt.trim().length < 8) {
    throw new Error(`website image is missing useful alt text: ${src}`);
  }
}

for (const required of [
  "website/dist/assets/viewer-screenshot.svg",
  "website/dist/assets/cli-screenshot.svg",
  "website/dist/assets/social-preview.svg",
  "website/dist/examples/project-state.ontos",
  "website/dist/app.js",
  "website/dist/styles.css"
]) {
  if (!existsSync(required)) {
    throw new Error(`website build is missing ${required}.`);
  }
}

console.log("website static QA ok");

function assertText(selector, expected) {
  const value = document.querySelector(selector)?.textContent ?? "";
  if (!value.includes(expected)) {
    throw new Error(`${selector} does not include ${expected}.`);
  }
}

function assertMeta(selector, expected) {
  const value = document.querySelector(selector)?.getAttribute("content") ?? "";
  if (!value.includes(expected)) {
    throw new Error(`${selector} does not include ${expected}.`);
  }
}

function assertAttr(selector, attr, expected) {
  const value = document.querySelector(selector)?.getAttribute(attr) ?? "";
  if (value !== expected) {
    throw new Error(`${selector} ${attr} should be ${expected}.`);
  }
}
