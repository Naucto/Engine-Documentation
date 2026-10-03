// Types for api.mjs, for the TypeScript that reads the manifest (the Frontend's parity test).

export interface ApiParam {
  name: string;
  type: string;
  description?: string;
  required?: boolean;
  optional?: boolean;
}

export interface ApiEntry {
  name: string;
  signature?: string;
  summary?: string;
  description?: string;
  params?: ApiParam[];
  returns?: string | null;
  returnType?: string;
  examples?: string[];
  aliases?: string[];
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

export function fullName(ns: ApiNamespace, entry: ApiEntry): string;
export function loadApi(apiDir: string): Promise<ApiNamespace[]>;
