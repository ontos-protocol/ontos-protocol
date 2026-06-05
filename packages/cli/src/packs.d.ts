import type { OntosAst, OntosFieldValue } from "@ontos-protocol/parser";

export type PackKind = "context" | "review" | "handoff" | "modify-boundary" | "verification";

export interface NodePackOptions {
  tokenBudget?: number;
  excludeFields?: Iterable<string>;
}

export interface NodePack {
  kind: PackKind;
  document: string;
  nodeId: string;
  path: string[];
  tokenBudget?: {
    requested: number;
    approximateCharacters: number;
    truncated: boolean;
  };
  fields: Record<string, OntosFieldValue>;
  linkedReferences: Array<{
    kind: "node" | "field" | "file" | "url";
    target: string;
    nodeId?: string;
    field?: string;
    path: string[];
  }>;
  sourceReferences: Array<{
    nodeId?: string;
    field: string;
    target: string;
  }>;
  text: string;
}

export declare function createNodePack(
  ast: OntosAst,
  nodeId: string,
  kind?: PackKind,
  options?: NodePackOptions
): NodePack;
export declare function exportPackMarkdown(pack: NodePack): string;
