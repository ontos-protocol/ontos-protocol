import type { OntosAst, OntosDiagnostic, OntosReference } from "@ontos-protocol/parser";

export interface ViewerNode {
  id?: string;
  parentId?: string;
  title: string;
  tags: string[];
  fields: Record<string, string | number | boolean | null | Array<string | number | boolean | null> | { kind: string; value: unknown; language?: string }>;
  references: OntosReference[];
  path: string[];
  depth: number;
  text: string;
  children: ViewerNode[];
}

export interface ViewerModel {
  ast: OntosAst;
  title: string;
  metadata: OntosAst["metadata"];
  diagnostics: OntosDiagnostic[];
  references: OntosReference[];
  nodes: ViewerNode[];
  flatNodes: ViewerNode[];
  stats: {
    nodes: number;
    fields: number;
    references: number;
  };
}

export interface RenderOptions {
  document?: Document;
  showToolbar?: boolean;
}

export interface ViewerAppOptions {
  document?: Document;
  initialSource?: string | OntosAst | null;
}

export type ViewerExportTarget = "md" | "html" | "json" | "opml";

export function createViewerModel(source: string | OntosAst): ViewerModel;
export function searchViewerModel(model: ViewerModel, query: string): ViewerNode[];
export function exportViewerDocument(sourceOrModel: string | OntosAst | ViewerModel, target: ViewerExportTarget): string;
export function createOntosViewer(source?: string | OntosAst | null, options?: RenderOptions): HTMLElement;
export function createOntosViewerApp(options?: ViewerAppOptions): HTMLElement;
export function renderOntosViewer(target: HTMLElement, source: string | OntosAst, options?: RenderOptions): ViewerModel;
export function focusViewerNode(root: ParentNode, nodeId: string): boolean;
export function defineOntosViewerElement(name?: string): CustomElementConstructor;
