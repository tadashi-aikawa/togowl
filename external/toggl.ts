import Axios from 'axios';

export namespace Api {
  export const BASE = 'https://toggl.com/api/v8';

  export interface Project {
    id: number;
    name: string;
  }

  export interface TimeEntry {
    id: number;
    wid: number;
    pid: number;
    start: string;
    duration: number;
    description: string;
    at: string;
  }

  export class RestClient {
    token: string;
    proxy: string | undefined;
    get auth() {
      return {
        username: this.token,
        password: 'api_token',
      };
    }

    constructor(token: string, proxy?: string) {
      this.token = token;
      this.proxy = proxy;
    }

    timeEntryCurrent(): Promise<TimeEntry> {
      return Axios.get(`${Api.BASE}/time_entries/current`, {
        auth: this.auth,
      }).then(p => p.data.data);
    }

    // projects(workspaceId: number): AxiosPromise<Project[]> {
    //   return Axios.get(`${Api.BASE}/workspaces/${workspaceId}/projects`, {
    //     auth: this.auth,
    //   });
    // }

    // startTimeEntry(description: string, projectId: number | undefined): AxiosPromise<any> {
    //   return Axios.post(
    //     `${Api.BASE}/time_entries/start`,
    //     {
    //       time_entry: { description, pid: projectId, created_with: 'togowl' },
    //     },
    //     {
    //       auth: this.auth,
    //     },
    //   );
    // }
  }
}
