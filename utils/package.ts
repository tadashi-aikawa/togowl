import * as pkg from "~/package.json";

export function getAppVersion(): string {
  return pkg.version;
}
