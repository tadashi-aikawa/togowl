import Axios from 'axios';

export interface Project {
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
    onResponsePing?: () => void;
  }

  type ActionType = 'INSERT' | 'UPDATE' | 'DELETE' | string;
  interface TimeEntryEvent {
    action: ActionType;
    model: 'time_entry';
    data: TimeEntry;
  }
  // 仮
  interface ProjectEvent {
    action: ActionType;
    model: 'project';
    data: Project;
  }
  interface PingEvent {
    type: 'ping';
    model: null;
  }
  type EventMessage = TimeEntryEvent | ProjectEvent | PingEvent;

  export class Client {
    private constructor(private socket: WebSocket, private onCloseListener: any) {}

    terminate() {
      this.socket.removeEventListener('close', this.onCloseListener);
      this.socket.close(1000, 'Terminate client.');
    }

    static use(token: string, listener: EventListener): Client {
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
            // TODO
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

      return new Client(socket, onCloseListener);
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

  export class Client {
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
