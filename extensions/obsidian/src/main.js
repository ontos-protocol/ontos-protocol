import {
  Modal,
  Notice,
  Plugin,
  PluginSettingTab,
  Setting
} from "obsidian";
import {
  collectReferences,
  findNodeById,
  getNodePath,
  parseOntosDocument,
  validateOntosDocument
} from "@ontos-protocol/parser";
import {
  exportMarkdown
} from "@ontos-protocol/cli/exporters";

const DEFAULT_SETTINGS = {
  validateOnOpen: true
};

export default class ProtocolPlugin extends Plugin {
  async onload() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    this.registerExtensions(["ontos"], "markdown");
    this.addSettingTab(new ProtocolSettingTab(this.app, this));

    this.addCommand({
      id: "preview-current-file",
      name: "Preview current .ontos file",
      checkCallback: (checking) => this.withActiveFile(checking, (file, text) => {
        new PreviewModal(this.app, file.basename, text).open();
      })
    });

    this.addCommand({
      id: "export-markdown",
      name: "Export current .ontos file to Markdown",
      checkCallback: (checking) => this.withActiveFile(checking, async (file, text) => {
        const ast = parseOntosDocument(text, { includeDiagnostics: false });
        const output = exportMarkdown(ast);
        await this.app.vault.create(`${file.parent?.path ?? ""}/${file.basename}.md`, output);
        new Notice("Markdown export created.");
      })
    });

    this.addCommand({
      id: "copy-node-id",
      name: "Copy node ID at cursor",
      checkCallback: (checking) => this.withActiveFile(checking, async (_file, text) => {
        const node = firstNode(parseOntosDocument(text, { includeDiagnostics: false }));
        if (!node?.id) {
          new Notice("No node ID found.");
          return;
        }
        await navigator.clipboard.writeText(node.id);
        new Notice("Node ID copied.");
      })
    });

    this.addCommand({
      id: "copy-node-path",
      name: "Copy node path at cursor",
      checkCallback: (checking) => this.withActiveFile(checking, async (_file, text) => {
        const ast = parseOntosDocument(text, { includeDiagnostics: false });
        const node = firstNode(ast);
        if (!node?.id) {
          new Notice("No node path found.");
          return;
        }
        await navigator.clipboard.writeText(getNodePath(ast, node.id).join(" > "));
        new Notice("Node path copied.");
      })
    });

    this.registerEvent(this.app.workspace.on("file-open", async (file) => {
      if (!this.settings.validateOnOpen || file?.extension !== "ontos") {
        return;
      }
      const text = await this.app.vault.read(file);
      const diagnostics = validateOntosDocument(text);
      if (diagnostics.length > 0) {
        new Notice(`.ontos document has ${diagnostics.length} diagnostics.`);
      }
    }));
  }

  async withActiveFile(checking, callback) {
    const file = this.app.workspace.getActiveFile();
    if (!file || file.extension !== "ontos") {
      return false;
    }
    if (!checking) {
      const text = await this.app.vault.read(file);
      await callback(file, text);
    }
    return true;
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }
}

class PreviewModal extends Modal {
  constructor(app, title, source) {
    super(app);
    this.title = title;
    this.source = source;
  }

  onOpen() {
    const ast = parseOntosDocument(this.source);
    this.contentEl.empty();
    this.contentEl.addClass("ontos-preview");
    this.contentEl.createEl("h1", { text: this.title });

    const diagnostics = ast.diagnostics ?? [];
    if (diagnostics.length > 0) {
      const list = this.contentEl.createEl("ul", { cls: "ontos-diagnostics" });
      for (const diagnostic of diagnostics) {
        list.createEl("li", { text: `${diagnostic.severity} ${diagnostic.code}: ${diagnostic.message}` });
      }
    }

    renderNodes(this.contentEl, ast, ast.nodes ?? []);
    const references = collectReferences(ast);
    if (references.length > 0) {
      const section = this.contentEl.createDiv({ cls: "ontos-references" });
      section.createEl("h2", { text: "References" });
      const list = section.createEl("ul");
      for (const reference of references) {
        list.createEl("li", { text: `${reference.kind}: ${reference.target}` });
      }
      renderBacklinks(section, ast, references);
    }
  }
}

class ProtocolSettingTab extends PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display() {
    this.containerEl.empty();
    new Setting(this.containerEl)
      .setName("Validate on open")
      .setDesc("Show a notice when an opened .ontos file has diagnostics.")
      .addToggle((toggle) => toggle
        .setValue(this.plugin.settings.validateOnOpen)
        .onChange(async (value) => {
          this.plugin.settings.validateOnOpen = value;
          await this.plugin.saveSettings();
        }));
  }
}

function renderNodes(parent, ast, nodes) {
  for (const node of nodes) {
    const details = parent.createEl("details", {
      cls: "ontos-node",
      attr: node.id ? { id: node.id, "data-node-id": node.id } : {}
    });
    details.open = true;
    details.createEl("summary", { text: node.id ? `${node.title} #${node.id}` : node.title });
    for (const [key, value] of Object.entries(node.fields ?? {})) {
      details.createEl("h3", { text: key });
      renderFieldValue(details, ast, value);
    }
    renderNodes(details, ast, node.children ?? []);
  }
}

function firstNode(ast) {
  const first = ast.nodes?.[0];
  return first?.id ? findNodeById(ast, first.id) : first;
}

function renderFieldValue(parent, ast, value) {
  if (value && typeof value === "object" && "kind" in value) {
    if (value.kind === "code") {
      const pre = parent.createEl("pre");
      pre.createEl("code", { text: String(value.value ?? "") });
      return;
    }
    renderFieldValue(parent, ast, value.value);
    return;
  }

  if (Array.isArray(value)) {
    const list = parent.createEl("ul");
    for (const item of value) {
      const entry = list.createEl("li");
      resolveNodeReferences(entry, ast, String(item ?? ""));
    }
    return;
  }

  const paragraph = parent.createEl("p");
  resolveNodeReferences(paragraph, ast, String(value ?? ""));
}

function resolveNodeReferences(parent, ast, text) {
  const pattern = /\[\[([^\]]+)\]\]/gu;
  let cursor = 0;
  for (const match of text.matchAll(pattern)) {
    if (match.index > cursor) {
      parent.appendText(text.slice(cursor, match.index));
    }
    const target = match[1];
    const targetNodeId = target.split(".")[0];
    const path = getNodePath(ast, targetNodeId);
    if (path.length > 0) {
      parent.createEl("a", {
        text: `[[${target}]]`,
        cls: "ontos-reference-link",
        attr: {
          href: `#${targetNodeId}`,
          "data-ontos-target": target,
          title: path.join(" > ")
        }
      });
    } else {
      parent.createSpan({
        text: `[[${target}]]`,
        cls: "ontos-reference-missing"
      });
    }
    cursor = match.index + match[0].length;
  }
  if (cursor < text.length) {
    parent.appendText(text.slice(cursor));
  }
}

function renderBacklinks(parent, ast, references) {
  const backlinks = new Map();
  for (const reference of references) {
    const targetNodeId = reference.target.split(".")[0];
    if (!findNodeById(ast, targetNodeId)) {
      continue;
    }
    const entries = backlinks.get(targetNodeId) ?? [];
    entries.push(reference);
    backlinks.set(targetNodeId, entries);
  }

  if (backlinks.size === 0) {
    return;
  }

  const section = parent.createDiv({ cls: "ontos-backlinks" });
  section.createEl("h2", { text: "Backlinks" });
  for (const [targetNodeId, entries] of backlinks) {
    const group = section.createEl("section");
    group.createEl("h3", { text: `[[${targetNodeId}]]` });
    const list = group.createEl("ul");
    for (const reference of entries) {
      const sourcePath = reference.nodeId ? getNodePath(ast, reference.nodeId).join(" > ") : "Unknown source";
      list.createEl("li", { text: `${sourcePath}: ${reference.field} -> ${reference.target}` });
    }
  }
}
