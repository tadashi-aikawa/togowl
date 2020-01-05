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
    onClose?: () => void;
    onError?: (err: unknown) => void;
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
    private constructor(socket: WebSocket) {}

    static use(token: string, listener: EventListener): Client {
      return new Client(this.createSocket('wss://stream.toggl.com/ws', token, listener));
    }

    static createSocket(url: string, token: string, listener: EventListener): WebSocket {
      const authentication = JSON.stringify({ type: 'authenticate', api_token: token });
      const pingResponse = JSON.stringify({ type: 'pong' });

      const socket = new WebSocket(url);
      socket.addEventListener('open', ev => {
        try {
          socket.send(authentication);
          listener.onOpen?.();
        } catch (err) {
          listener.onError?.(err);
        }
      });
      socket.addEventListener('close', ev => listener.onClose?.());
      socket.addEventListener('error', err => listener.onError?.(err));
      socket.addEventListener('message', ev => {
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
      });
      return socket;
    }
  }
}

export namespace RestApi {
  export interface TimeEntryCurrentResponse {
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

    // projects(workspaceId: number): AxiosPromise<Project[]> {
    //   return Axios.get(`${this.baseUrl}/workspaces/${workspaceId}/projects`, {
    //     auth: this.auth,
    //   });
    // }

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
