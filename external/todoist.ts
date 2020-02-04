/* eslint-disable camelcase */
import Axios, { AxiosPromise } from 'axios';
import { stringify } from 'query-string';
import { Dictionary } from 'lodash';

export namespace SyncApi {
  export interface Project {
    id: number;
    name: string;
    /** 0: exists, 1: removed */
    is_deleted: number;
  }

  interface Due {
    date: string;
    is_recurring: boolean;
    lang: string;
    string: string;
  }

  export interface Task {
    id: number;
    content: string;
    day_order: number;
    parent_id: number | null;
    project_id: number | null;
    due: Due | null;
    /** 0: 通常 ～ 4: 緊急 */
    priority: number;
    /** 0: 未完了, 1: 完了 */
    checked: number;
    /** 0: 存在する, 1: 消された */
    is_deleted: number;
  }

  export interface Root {
    full_sync: boolean;
    sync_token: string;
    items?: Task[];
    projects?: Project[];
    day_orders?: Dictionary<number>;
  }

  export class SyncClient {
    private readonly baseUrl: string;
    private readonly token: string;

    constructor(token: string) {
      this.baseUrl = 'https://api.todoist.com/sync/v8';
      this.token = token;
    }

    sync(resourceTypes: string[], syncToken: string = '*'): AxiosPromise<Root> {
      return Axios.post(
        '/sync',
        stringify({
          token: this.token,
          sync_token: syncToken,
          resource_types: JSON.stringify(resourceTypes),
        }),
        { baseURL: this.baseUrl, headers: { Origin: '*' } },
      );
    }
  }
}

export namespace RestApi {
  export class RestClient {
    private readonly baseUrl: string;
    private readonly token: string;

    constructor(token: string) {
      this.baseUrl = 'https://api.todoist.com/rest/v1';
      this.token = token;
    }

    closeTask(taskId: number): AxiosPromise<void> {
      return Axios.post(`${this.baseUrl}/tasks/${taskId}/close`, undefined, {
        headers: {
          Authorization: `Bearer ${this.token}`,
        },
      });
    }
  }
}
