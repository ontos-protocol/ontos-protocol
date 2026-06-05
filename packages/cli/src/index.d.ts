export declare function main(argv?: string[], io?: CliIo): Promise<number>;
export declare function run(argv: string[], io?: CliIo): number;

export interface CliIo {
  stdin?: string;
  out(value: string): void;
  err(value: string): void;
}
