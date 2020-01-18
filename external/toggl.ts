import Axios from 'axios';

export interface Project {
  id: number;
  cid?: number;
  name: string;
}

export interface Client {
  id: number;
  name: string;
}

export interface TimeEntry {
  id: number;
  wid: number;
  pid: number;
  start: string;
  stop: string | null;
  duration: number;
  description: string;
  at: string;
  tags: number[];
}

export namespace SocketApi {
  interface EventListener {
    onOpen?: () => void;
    onClose?: (event: CloseEvent) => void;
    onError?: (err: any) => void;
    onInsertEntry?: (entry: TimeEntry) => void;
    onUpdateEntry?: (entry: TimeEntry) => void;
    onDeleteEntry?: (entry: TimeEntry) => void;
    // onInsertProject is not existed
    onUpdateProject?: (entry: Project) => void;
    onDeleteProject?: (entry: Project) => void;
    // onInsertClient is not existed
    onUpdateClient?: (entry: Client) => void;
    onDeleteClient?: (entry: Client) => void;
    onResponsePing?: () => void;
  }

  type TimeEntryActionType = 'INSERT' | 'UPDATE' | 'DELETE' | string;
  type ProjectActionType = 'update' | 'delete' | string;
  type ClientActionType = 'update' | 'delete' | string;
  interface TimeEntryEvent {
    action: TimeEntryActionType;
    model: 'time_entry';
    data: TimeEntry;
  }
  interface ProjectEvent {
    action: ProjectActionType;
    model: 'project';
    data: Project;
  }
  interface ClientEvent {
    action: ClientActionType;
    model: 'client';
    data: Client;
  }
  interface PingEvent {
    type: 'ping';
    model: null;
  }
  type EventMessage = TimeEntryEvent | ProjectEvent | ClientEvent | PingEvent;

  export class ApiClient {
    private constructor(private socket: WebSocket, private onCloseListener: any) {}

    terminate() {
      this.socket.removeEventListener('close', this.onCloseListener);
      this.socket.close(1000, 'Terminate client.');
    }

    static use(token: string, listener: EventListener): ApiClient {
      const socket = new WebSocket('wss://stream.toggl.com/ws');

      const onOpenListener = (ev: WebSocketEventMap['open']) => {
        const authentication = JSON.stringify({ type: 'authenticate', api_token: token });
        try {
          socket.send(authentication);
          listener.onOpen?.();
        } catch (err) {
          listener.onError?.(err);
        }
      };
      const onCloseListener = (ev: WebSocketEventMap['close']) => listener.onClose?.(ev);
      const onErrorListener = (ev: WebSocketEventMap['error']) => listener.onError?.(ev);
      const onMessageListener = (ev: WebSocketEventMap['message']) => {
        const pingResponse = JSON.stringify({ type: 'pong' });
        const data: EventMessage = JSON.parse(ev.data);
        switch (data.model) {
          case 'time_entry':
            switch (data.action) {
              case 'INSERT':
                listener.onInsertEntry?.(data.data);
                break;
              case 'UPDATE':
                listener.onUpdateEntry?.(data.data);
                break;
              case 'DELETE':
                listener.onDeleteEntry?.(data.data);
                break;
              default:
                console.error('Unexpected action: ', data.action);
            }
            break;
          case 'project':
            switch (data.action) {
              // case 'insert' is not existed
              case 'update':
                listener.onUpdateProject?.(data.data);
                break;
              case 'delete':
                listener.onDeleteProject?.(data.data);
                break;
              default:
                console.error('Unexpected action: ', data.action);
            }
            break;
          case 'client':
            switch (data.action) {
              // case 'insert' is not existed
              case 'update':
                listener.onUpdateClient?.(data.data);
                break;
              case 'delete':
                listener.onDeleteClient?.(data.data);
                break;
              default:
                console.error('Unexpected action: ', data.action);
            }
            break;
          default:
            // {type: "ping"} or {session_id: "...."}
            if (data.type === 'ping') {
              socket.send(pingResponse);
              listener.onResponsePing?.();
            }
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

export namespace RestApi {
  export interface TimeEntryCurrentResponse {
    data: TimeEntry;
  }

  export interface TimeEntryStopResponse {
    data: TimeEntry;
  }

  export class ApiClient {
    baseUrl: string;
    token: string;

    get auth() {
      return {
        username: this.token,
        password: 'api_token',
      };
    }

    constructor(token: string, proxy?: string) {
      this.token = token;
      this.baseUrl = proxy ? `https://${proxy}/toggl.com/api/v8` : 'https://toggl.com/api/v8';
    }

    timeEntryCurrent(): Promise<TimeEntryCurrentResponse> {
      return Axios.get(`${this.baseUrl}/time_entries/current`, {
        auth: this.auth,
      }).then(p => p.data);
    }

    timeEntryStop(timeEntryId: number): Promise<TimeEntryCurrentResponse> {
      return Axios.put(`${this.baseUrl}/time_entries/${timeEntryId}/stop`, undefined, {
        auth: this.auth,
      }).then(p => p.data);
    }

    projects(workspaceId: number): Promise<Project[]> {
      return Axios.get(`${this.baseUrl}/workspaces/${workspaceId}/projects`, {
        auth: this.auth,
      }).then(p => p.data);
    }

    clients(workspaceId: number): Promise<Client[]> {
      return Axios.get(`${this.baseUrl}/workspaces/${workspaceId}/clients`, {
        auth: this.auth,
      }).then(p => p.data);
    }

    // startTimeEntry(description: string, projectId: number | undefined): AxiosPromise<any> {
    //   return Axios.post(
    //     `${this.baseUrl}/time_entries/start`,
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
