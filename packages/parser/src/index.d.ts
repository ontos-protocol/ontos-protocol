export interface OntosAst {
  schemaVersion: "1.0";
  formatVersion: "1.0";
  metadata: Record<string, string | number | boolean | null>;
  nodes: OntosNode[];
  diagnostics?: OntosDiagnostic[];
  comments?: OntosComment[];
}

export interface OntosNode {
  id?: string;
  title: string;
  tags: string[];
  fields: Record<string, OntosFieldValue>;
  children: OntosNode[];
  references?: OntosReference[];
}

export type OntosFieldValue =
  | string
  | number
  | boolean
  | null
  | Array<string | number | boolean | null>
  | {
      kind: "text" | "list" | "code" | "reference" | "object";
      value: unknown;
      language?: string;
    };

export interface OntosDiagnostic {
  code: string;
  severity: "error" | "warning" | "info";
  message: string;
  source?: OntosSourceRange;
  nodeId?: string;
  field?: string;
  suggestion?: string;
}

export interface OntosReference {
  kind: "node" | "field" | "file" | "url";
  target: string;
  nodeId?: string;
  field?: string;
}

export interface OntosComment {
  text: string;
  source: OntosSourceRange;
}

export interface OntosSourceRange {
  start: OntosSourcePosition;
  end: OntosSourcePosition;
}

export interface OntosSourcePosition {
  line: number;
  column: number;
  offset?: number;
}

export interface ParseOptions {
  includeDiagnostics?: boolean;
  preserveComments?: boolean;
  maxInputBytes?: number;
  maxDepth?: number;
  mode?: "tolerant" | "strict";
  includeSourceLocations?: boolean;
  requireNodeIds?: boolean;
  checkRecommendedFields?: boolean;
  checkFormatting?: boolean;
  deprecatedFields?: Record<string, string | null>;
}

export interface SerializeOptions {
  finalNewline?: boolean;
}

export interface StableNodeIdOptions {
  existingIds?: Iterable<string>;
  maxLength?: number;
  fallback?: string;
}

export declare class OntosParseError extends Error {
  diagnostics: OntosDiagnostic[];
  ast: OntosAst;
}

export declare function parseOntosDocument(text: string, options?: ParseOptions): OntosAst;
export declare function serializeOntosDocument(ast: OntosAst, options?: SerializeOptions): string;
export declare function formatOntosDocument(text: string, options?: SerializeOptions): string;
export declare function validateOntosDocument(astOrText: OntosAst | string, options?: ParseOptions): OntosDiagnostic[];
export declare function findNode(ast: OntosAst, selector: string | { id?: string }): OntosNode | undefined;
export declare function findNodeById(ast: OntosAst, nodeId: string): OntosNode | undefined;
export declare function getNodePath(ast: OntosAst, nodeId: string): string[];
export declare function getNodeText(ast: OntosAst, nodeId: string): string;
export declare function walkNodes(ast: OntosAst, visitor: (node: OntosNode) => void): void;
export declare function collectReferences(ast: OntosAst): OntosReference[];
export declare function createStableNodeId(title: string, options?: StableNodeIdOptions): string;
