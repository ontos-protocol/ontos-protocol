import { existsSync, readFileSync } from "node:fs";
import { JSDOM } from "jsdom";

const requiredFiles = [
  "apps/viewer/dist/index.html",
  "apps/viewer/dist/styles.css",
  "apps/viewer/dist/app.js",
  "apps/viewer/dist/examples/project-state.ontos",
  "apps/viewer/dist/.nojekyll"
];

for (const file of requiredFiles) {
  if (!existsSync(file)) {
    throw new Error(`viewer app build is missing ${file}.`);
  }
}

const html = readFileSync("apps/viewer/dist/index.html", "utf8");
const styles = readFileSync("apps/viewer/dist/styles.css", "utf8");
const app = readFileSync("apps/viewer/dist/app.js", "utf8");
const document = new JSDOM(html).window.document;

if (!document.querySelector("main")) {
  throw new Error("viewer app needs a main landmark.");
}
if (!document.querySelector("#viewer-app")) {
  throw new Error("viewer app mount is missing.");
}
if (!document.querySelector("section[aria-labelledby='viewer-title']")) {
  throw new Error("viewer app section needs aria-labelledby.");
}
for (const required of [":focus-visible", "prefers-reduced-motion", "prefers-contrast"]) {
  if (!styles.includes(required)) {
    throw new Error(`viewer app styles are missing ${required}.`);
  }
}
for (const required of ["project-state.ontos", "createOntosViewerApp", "Local file stays"]) {
  if (!app.includes(required)) {
    throw new Error(`viewer app bundle is missing ${required}.`);
  }
}

console.log("viewer app static QA ok");
