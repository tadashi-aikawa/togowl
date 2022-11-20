const storage = window.localStorage;

const PREFIX = "togowl";

export namespace TaskProjectCountStorage {
  const key = `${PREFIX}_task-project-count`;

  export function getAll(): { [taskProjectId: string]: number } {
    const jsonStr = storage.getItem(key);
    return jsonStr ? JSON.parse(jsonStr) : {};
  }

  export function increase(
    taskProjectId: string
  ): { [taskProjectId: string]: number } {
    const obj = getAll() ?? {};
    if (obj[taskProjectId]) {
      obj[taskProjectId]++;
    } else {
      obj[taskProjectId] = 1;
    }
    storage.setItem(key, JSON.stringify(obj));
    return obj;
  }
}

// TODO: refactoring..
export namespace EntryCountStorage {
  const key = `${PREFIX}_entry-count`;

  export function getAll(): { [entryHash: string]: number } {
    const jsonStr = storage.getItem(key);
    return jsonStr ? JSON.parse(jsonStr) : {};
  }

  export function increase(hash: string): { [entryHash: string]: number } {
    const obj = getAll() ?? {};
    if (obj[hash]) {
      obj[hash]++;
    } else {
      obj[hash] = 1;
    }
    storage.setItem(key, JSON.stringify(obj));
    return obj;
  }
}
