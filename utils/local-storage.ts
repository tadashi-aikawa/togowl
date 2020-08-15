const storage = window.localStorage;

const PREFIX = "togowl";

export namespace TaskProjectCountStorage {
  const key = `${PREFIX}_task-project-count`;

  export function getAll(): { [taskProjectId: number]: number } {
    const jsonStr = storage.getItem(key);
    return jsonStr ? JSON.parse(jsonStr) : {};
  }

  export function increase(
    taskProjectId: number
  ): { [taskProjectId: number]: number } {
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
