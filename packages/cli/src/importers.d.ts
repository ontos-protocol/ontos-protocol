export interface MarkdownImportWarning {
  code: string;
  message: string;
}

export interface MarkdownImportReport {
  source: "markdown";
  headings: number;
  paragraphs: number;
  bulletLists: number;
  orderedLists: number;
  codeBlocks: number;
  tables: number;
  blockquotes: number;
  frontMatterFields: number;
  warnings: MarkdownImportWarning[];
}

export interface MarkdownImportResult {
  document: string;
  report: MarkdownImportReport;
}

export declare function convertMarkdownToOntos(markdown: string, fallbackTitle?: string): string;
export declare function convertMarkdownToOntosResult(markdown: string, fallbackTitle?: string): MarkdownImportResult;
export declare function convertOpmlToOntos(opml: string, fallbackTitle?: string): string;
