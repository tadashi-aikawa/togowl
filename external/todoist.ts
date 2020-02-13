/* eslint-disable camelcase */
import Axios, { AxiosPromise } from 'axios';
import { stringify } from 'query-string';
import { Dictionary } from 'lodash';
const uuidv4 = require('uuid/v4');

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
    timezone: string | null;
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
        { baseURL: this.baseUrl },
      );
    }

    syncItemUpdate(taskId: number, due: Partial<Due>, syncToken = '*'): AxiosPromise<Root> {
      return Axios.post(
        '/sync',
        stringify({
          token: this.token,
          sync_token: syncToken,
          resource_types: JSON.stringify(['items']),
          commands: JSON.stringify([
            {
              type: 'item_update',
              uuid: uuidv4(),
              args: {
                id: taskId,
                due: due,
              },
            },
          ]),
        }),
        { baseURL: this.baseUrl },
      );
    }

    syncItemUpdateDayOrders(orderByTaskId: { [taskId: number]: number }): AxiosPromise<any> {
      return Axios.post(
        '/sync',
        stringify({
          token: this.token,
          commands: JSON.stringify([
            {
              type: 'item_update_day_orders',
              uuid: uuidv4(),
              args: {
                ids_to_orders: orderByTaskId,
              },
            },
          ]),
        }),
        { baseURL: this.baseUrl },
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

export namespace SocketApi {
  interface EventListener {
    onOpen?: () => void;
    onSyncNeeded?: () => void;
    onClose?: (event: CloseEvent) => void;
    onError?: (err: any) => void;
  }

  interface SyncNeededEvent {
    type: 'sync_needed';
  }
  interface AgendaUpdatedEvent {
    type: 'agenda_updated';
  }
  type EventMessage = SyncNeededEvent | AgendaUpdatedEvent;

  export class ApiClient {
    private constructor(private socket: WebSocket, private onCloseListener: any) {}

    terminate() {
      this.socket.removeEventListener('close', this.onCloseListener);
      this.socket.close(1000, 'Terminate client.');
    }

    static use(token: string, listener: EventListener): ApiClient {
      const socket = new WebSocket(`wss://ws.todoist.com/ws?token=${token}`);

      const onOpenListener = (ev: WebSocketEventMap['open']) => listener.onOpen?.();
      const onCloseListener = (ev: WebSocketEventMap['close']) => listener.onClose?.(ev);
      const onErrorListener = (ev: WebSocketEventMap['error']) => listener.onError?.(ev);
      const onMessageListener = (ev: WebSocketEventMap['message']) => {
        const data: EventMessage = JSON.parse(ev.data);
        switch (data.type) {
          case 'sync_needed':
            listener.onSyncNeeded?.();
            break;
          case 'agenda_updated':
            // DO NOTHING
            break;
          default:
          // DO NOTHING
        }
      };

      socket.addEventListener('open', onOpenListener);
      socket.addEventListener('close', onCloseListener);
      socket.addEventListener('error', onErrorListener);
      socket.addEventListener('message', onMessageListener);

      return new ApiClient(socket, onCloseListener);
    }
  }
}
