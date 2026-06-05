import type { OntosAst } from "@ontos-protocol/parser";

export interface MarkdownExportOptions {
  frontMatter?: boolean;
  toc?: boolean;
  headingOffset?: number;
}

export interface HtmlExportOptions {
  searchIndex?: boolean;
}

export interface OpmlExportOptions {
  fields?: string[];
}

export declare function exportJson(ast: OntosAst): string;
export declare function exportMarkdown(ast: OntosAst, options?: MarkdownExportOptions): string;
export declare function exportHtml(ast: OntosAst, options?: HtmlExportOptions): string;
export declare function exportOpml(ast: OntosAst, options?: OpmlExportOptions): string;
