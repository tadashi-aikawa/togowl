import * as pkg from "~/package.json";

export function appVersion(): string {
  return pkg.version;
}
