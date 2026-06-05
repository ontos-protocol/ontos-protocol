import { createOntosViewerApp } from "../../../packages/viewer/src/index.js";

start();

async function start() {
  const mount = document.querySelector("#viewer-app");
  const sample = await fetch("./examples/project-state.ontos").then((response) => response.text());
  mount.appendChild(createOntosViewerApp({ document, initialSource: sample }));
}
