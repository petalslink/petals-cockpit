// Typings reference file, see links for more information
// https://github.com/typings/typings
// https://www.typescriptlang.org/docs/handbook/writing-declaration-files.html

declare var System: any;

declare interface ObjectConstructor {
  assign(...objects: Object[]): Object;
}

// Type definitions for Server-Sent Events
// Specification: http://dev.w3.org/html5/eventsource/
// Definitions by: Yannik Hampe <https://github.com/yankee42>

declare var EventSource: sse.IEventSourceStatic;

declare module sse {
  // the readyState attribute represents the state of the connection
  enum ReadyState {
    // the connection has not yet been established, or it was closed and the user agent is reconnecting
    CONNECTING = 0,

    // the user agent has an open connection and is dispatching events as it receives them
    OPEN = 1,

    // the connection is not open, and the user agent is not trying to reconnect
    // either there was a fatal error or the close() method was invoked
    CLOSED = 2
  }

  interface IEventSourceStatic extends EventTarget {
    new (url: string, eventSourceInitDict?: IEventSourceInit): IEventSourceStatic;
    // The serialisation of this EventSource object's url
    url: string;
    withCredentials: boolean;
    // Always 0
    CONNECTING: ReadyState;
    // Always 1
    OPEN: ReadyState;
    // Always 2
    CLOSED: ReadyState;
    // The ready state of the underlying connection
    readyState: ReadyState;
    onopen: (event: Event) => any;
    onmessage: (event: IOnMessageEvent) => void;
    onerror: (event: Event) => any;
    // the close() method must abort any instances of the fetch algorithm started for this EventSource object
    // and must set the readyState attribute to CLOSED
    close: () => void;
  }

  interface IEventSourceInit {
    // defines if request should set corsAttributeState to true
    withCredentials?: boolean;
  }

  interface IOnMessageEvent {
    event: string;
    data: string;
  }
}
