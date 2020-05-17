/* eslint-disable camelcase */
import Axios, { AxiosPromise } from "axios";
import { stringify } from "query-string";
import { Dictionary } from "lodash";

const uuidv4 = require("uuid/v4");

export namespace SyncApi {
  export type ResourceType =
    | "all"
    | "items"
    | "day_orders"
    | "projects"
    | "notes";
  export interface Command {
    type: "item_update" | "item_update_day_orders" | "item_close";
    uuid: string;
    args: { [key: string]: any };
  }

  export interface Note {
    id: number;
    item_id: number;
    project_id: number;
    content: string;
    /** "2020-05-17T03:58:17Z` */
    posted: string;
    /** 0: exists, 1: removed */
    is_deleted: number;
  }

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
    notes?: Note[];
    day_orders?: Dictionary<number>;
  }

  export class SyncClient {
    private readonly SYNC_RESOURCES: ResourceType[] = [
      "items",
      "day_orders",
      "projects",
      "notes",
    ];

    private readonly baseUrl: string;
    private readonly token: string;

    constructor(token: string) {
      this.baseUrl = "https://api.todoist.com/sync/v8";
      this.token = token;
    }

    sync(
      resourceTypes: ResourceType[],
      syncToken = "*",
      commands: Command[] = []
    ): AxiosPromise<Root> {
      return Axios.post(
        "/sync",
        stringify({
          token: this.token,
          sync_token: syncToken,
          resource_types: JSON.stringify(resourceTypes),
          commands: commands.length > 0 ? JSON.stringify(commands) : undefined,
        }),
        { baseURL: this.baseUrl }
      );
    }

    syncAll(syncToken = "*"): AxiosPromise<Root> {
      return this.sync(this.SYNC_RESOURCES, syncToken);
    }

    syncItemUpdate(
      taskId: number,
      due: Partial<Due>,
      syncToken = "*"
    ): AxiosPromise<Root> {
      return this.sync(this.SYNC_RESOURCES, syncToken, [
        {
          type: "item_update",
          uuid: uuidv4(),
          args: {
            id: taskId,
            due,
          },
        },
      ]);
    }

    syncItemUpdateDayOrders(
      orderByTaskId: { [taskId: number]: number },
      syncToken = "*"
    ): AxiosPromise<Root> {
      return this.sync(this.SYNC_RESOURCES, syncToken, [
        {
          type: "item_update_day_orders",
          uuid: uuidv4(),
          args: {
            ids_to_orders: orderByTaskId,
          },
        },
      ]);
    }

    syncItemClose(taskId: number, syncToken = "*"): AxiosPromise<Root> {
      return this.sync(this.SYNC_RESOURCES, syncToken, [
        {
          type: "item_close",
          uuid: uuidv4(),
          args: {
            id: taskId,
          },
        },
      ]);
    }
  }
}

export namespace SocketApi {
  interface EventListener {
    onOpen?: () => void;
    onSyncNeeded?: (clientId?: string) => void;
    onClose?: (event: CloseEvent) => void;
    onError?: (err: any) => void;
  }

  interface SyncNeededEvent {
    type: "sync_needed";
    client_id?: string;
  }
  interface AgendaUpdatedEvent {
    type: "agenda_updated";
  }
  type EventMessage = SyncNeededEvent | AgendaUpdatedEvent;

  export class ApiClient {
    private constructor(
      private socket: WebSocket,
      private onCloseListener: any
    ) {}

    terminate() {
      this.socket.removeEventListener("close", this.onCloseListener);
      this.socket.close(1000, "Terminate client.");
    }

    static use(token: string, listener: EventListener): ApiClient {
      const socket = new WebSocket(`wss://ws.todoist.com/ws?token=${token}`);

      const onOpenListener = (_ev: WebSocketEventMap["open"]) =>
        listener.onOpen?.();
      const onCloseListener = (ev: WebSocketEventMap["close"]) =>
        listener.onClose?.(ev);
      const onErrorListener = (ev: WebSocketEventMap["error"]) =>
        listener.onError?.(ev);
      const onMessageListener = (ev: WebSocketEventMap["message"]) => {
        const data: EventMessage = JSON.parse(ev.data);
        switch (data.type) {
          case "sync_needed":
            listener.onSyncNeeded?.(data.client_id);
            break;
          case "agenda_updated":
            // DO NOTHING
            break;
          default:
          // DO NOTHING
        }
      };

      socket.addEventListener("open", onOpenListener);
      socket.addEventListener("close", onCloseListener);
      socket.addEventListener("error", onErrorListener);
      socket.addEventListener("message", onMessageListener);

      return new ApiClient(socket, onCloseListener);
    }
  }
}
