import {
  createOntosViewerApp,
  createViewerModel,
  exportViewerDocument
} from "../../packages/viewer/src/index.js";

const sampleSource = `@ontos 1.0
@title Website demo project
@type project-state
@updated 2026-06-05

- Public release @id(public-release) #release
  status: active
  purpose: Show how .ontos keeps release context structured.
  ai_task: Identify unchecked launch blockers.
  ai_boundary: Use only public repository context.
  verify:
    - Run npm run release:check.
    - Confirm examples validate and export.

  - Viewer demo @id(viewer-demo) #viewer
    status: ready
    depends_on: [[public-release]]
    purpose: Let visitors inspect a structured project document.
    verify:
      - Search for release.
      - Export JSON from the toolbar.

    - AI pack @id(ai-pack) #ai
      purpose: Show focused context for AI tools.
      verify:
        - Pack includes path, fields, and boundaries.
`;

const examples = [
  { file: "app-design.ontos", label: "App design", keywords: "product design app ux frontend" },
  { file: "project-state.ontos", label: "Project state", keywords: "status progress current release" },
  { file: "ai-handoff.ontos", label: "AI handoff", keywords: "handoff context boundary task" },
  { file: "bug-fix.ontos", label: "Bug fix", keywords: "bug issue verify risk" },
  { file: "review-pack.ontos", label: "Review pack", keywords: "review code audit quality" },
  { file: "product-spec.ontos", label: "Product spec", keywords: "requirements acceptance product" },
  { file: "release-plan.ontos", label: "Release plan", keywords: "launch release checklist" },
  { file: "team-knowledge.ontos", label: "Team knowledge", keywords: "knowledge team decisions" },
  { file: "research-notes.ontos", label: "Research notes", keywords: "research source notes" },
  { file: "open-source-roadmap.ontos", label: "Open source roadmap", keywords: "roadmap governance community" }
];

installCopyButtons();

const viewerDemo = document.querySelector("#viewer-demo");
viewerDemo.appendChild(createOntosViewerApp({ document, initialSource: sampleSource }));
viewerDemo.addEventListener("ontos-export", (event) => {
  const blob = new Blob([event.detail.content], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = event.detail.filename;
  link.click();
  URL.revokeObjectURL(url);
});

const examplesList = document.querySelector("#examples-list");
const examplesSearch = document.querySelector("#examples-search");
const examplesEmpty = document.querySelector("#examples-empty");
renderExamples(examples);
examplesSearch.addEventListener("input", () => {
  const query = examplesSearch.value.trim().toLowerCase();
  renderExamples(
    examples.filter((example) =>
      [example.file, example.label, example.keywords]
        .join(" ")
        .toLowerCase()
        .includes(query)
    )
  );
});

const model = createViewerModel(sampleSource);
const pack = {
  kind: "context",
  document: model.title,
  nodeId: "public-release",
  path: ["Public release"],
  fields: model.flatNodes[0].fields,
  text: model.flatNodes[0].text
};

document.querySelector("#pack-demo code").textContent = `# .ontos ${pack.kind} pack

document: ${pack.document}
node: ${pack.nodeId}
path: ${pack.path.join(" > ")}

${exportViewerDocument(model, "md").split("\\n").slice(0, 14).join("\\n")}`;
installCopyButtons();

function renderExamples(items) {
  examplesList.textContent = "";
  for (const example of items) {
    const link = document.createElement("a");
    link.href = `./examples/${example.file}`;
    link.textContent = example.label;
    const meta = document.createElement("span");
    meta.textContent = example.file;
    link.appendChild(meta);
    examplesList.appendChild(link);
  }
  examplesEmpty.hidden = items.length > 0;
}

function installCopyButtons() {
  for (const pre of document.querySelectorAll("pre:not(.copy-ready)")) {
    pre.classList.add("copy-ready");
    const shell = document.createElement("div");
    shell.className = "copy-shell";
    pre.replaceWith(shell);
    shell.appendChild(pre);
    const button = document.createElement("button");
    button.className = "copy-button";
    button.type = "button";
    button.textContent = "Copy";
    button.setAttribute("aria-label", "Copy code block");
    button.addEventListener("click", async () => {
      try {
        await navigator.clipboard?.writeText(pre.textContent ?? "");
        button.textContent = "Copied";
      } catch {
        button.textContent = "Select";
      }
      setTimeout(() => {
        button.textContent = "Copy";
      }, 1200);
    });
    shell.appendChild(button);
  }
}
