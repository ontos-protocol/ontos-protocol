import { existsSync, readFileSync } from "node:fs";
import { JSDOM } from "jsdom";

const workflow = ".github/workflows/deploy-docs.yml";
if (!existsSync(workflow)) {
  throw new Error("deploy docs workflow is missing.");
}

const workflowText = readFileSync(workflow, "utf8");
for (const required of [
  "actions/upload-pages-artifact@v3",
  "actions/deploy-pages@v4",
  "Install system dependencies",
  "apt-get install -y ffmpeg",
  "npm run release:check",
  "path: website/dist"
]) {
  if (!workflowText.includes(required)) {
    throw new Error(`deploy docs workflow is missing ${required}.`);
  }
}

const html = readFileSync("website/dist/index.html", "utf8");
const document = new JSDOM(html).window.document;
const canonical = document.querySelector("link[rel='canonical']")?.getAttribute("href") ?? "";
if (canonical !== "https://ontos-protocol.github.io/ontos-protocol/") {
  throw new Error("website canonical URL is missing or incorrect.");
}
if (document.querySelector("select#docs-version")?.value !== "1.0.0") {
  throw new Error("website docs version selector is missing 1.0.0.");
}
if (document.querySelector("meta[property='og:url']")?.getAttribute("content") !== canonical) {
  throw new Error("website og:url must match canonical URL.");
}

const sitemap = readFileSync("website/dist/sitemap.xml", "utf8");
if (!sitemap.includes(canonical)) {
  throw new Error("sitemap is missing canonical URL.");
}

console.log("deployment config ok");
