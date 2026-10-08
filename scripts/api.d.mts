// Types for api.mjs, for the TypeScript that reads the manifest (the Frontend's parity test).

export interface ApiParam {
  name: string;
  type: string;
  description?: string;
  required?: boolean;
  optional?: boolean;
  /** What a left-out optional parameter stands for, as the engine writes it. */
  default?: string;
}

export interface ApiEntry {
  name: string;
  signature?: string;
  summary?: string;
  description?: string;
  /**
   * A list on a standard Lua entry; on a console entry, descriptions keyed by parameter name until
   * `withEngine` turns them into the engine's list.
   */
  params?: ApiParam[] | Record<string, string>;
  returns?: string | null;
  returnType?: string;
  examples?: string[];
  seeAlso?: string[];
  picture?: string;
  standard?: boolean;
  manual?: string;
  /** The file the entry was read from. */
  file: string;
}

export interface ApiNamespace {
  namespace: string;
  title: string;
  /** A standard Lua library rather than one of the console's own namespaces. */
  standard?: boolean;
  /** Its functions are globals, called by their bare name. */
  globals?: boolean;
  manual?: string;
  dir: string;
  functions: ApiEntry[];
  values: ApiEntry[];
}

/** One member of the console API as the engine registers it. */
export interface EngineMember {
  ns: string;
  name: string;
  kind: 'function' | 'value';
  signature: string;
  summary: string;
  params: readonly { name: string; type: string; optional: boolean; default?: string }[];
  returns: string | null;
}

export const engineApiPath: string;
export function fullName(ns: ApiNamespace, entry: ApiEntry): string;
export function loadApi(apiDir: string): Promise<ApiNamespace[]>;
export function readEngineApi(path?: string): Promise<EngineMember[] | null>;
export function withEngine(
  namespaces: ApiNamespace[],
  engine: readonly EngineMember[],
): { namespaces: ApiNamespace[]; problems: string[] };
