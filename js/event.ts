type Callback<T = any> = (data: T) => unknown;

class Event {
    callbacks: Callback[];
    constructor() {
        this.callbacks = [];
    }
    registerCallback(callback: Callback) {
        this.callbacks.push(callback);
    }
    fire(data: any) {
        this.callbacks.forEach((cb) => cb(data));
    }
}

const ONWSCLOSE_SECRET = "wsclose_ZQ4hNB3vUc33q7Y7K1os";

export class WSEventDispatcher {
    websocketPath: string;
    pollingBase: string;
    pollingPath: string;
    connected: boolean;
    lastMessage: number;
    events: Record<string, Event>;
    channels: string[];
    autoReconnect: boolean;
    websocket: WebSocket | null = null;
    pollingRequest: JQuery.jqXHR<any> | null = null;
    #filterTimeout: ReturnType<typeof setTimeout> | null = null;
    #setFilters() {
        if (window.WebSocket) {
            this.#filterTimeout = setTimeout(() => {
                if (
                    this.websocket &&
                    this.websocket.readyState === WebSocket.OPEN &&
                    (this.websocket as any).readyForData === true
                ) {
                    this.websocket.send(
                        JSON.stringify({
                            command: "set-filter",
                            filter: this.channels,
                        }),
                    );
                } else {
                    this.#setFilters();
                }
            }, 200);
        } else {
            if (this.pollingRequest !== null) {
                this.pollingRequest.abort();
                this.pollingRequest = null;
            }
            this.pollingPath = this.pollingBase + this.channels.join("|");
            this.#initPoll();
        }
    }
    #initWebsocket() {
        this.websocket = new WebSocket(this.websocketPath);
        this.websocket.onopen = () => {
            if (this.websocket === null) return;

            this.websocket.send(
                JSON.stringify({
                    command: "start-msg",
                    start: this.lastMessage,
                }),
            );

            (this.websocket as any).readyForData = true;
        };
        this.websocket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            this.dispatch(data.channel, data.message);
            this.lastMessage = data.id;
        };
        this.websocket.onclose = (event) => {
            if (this.autoReconnect) {
                console.log("Lost websocket connection! Attempt reconnecting in 1 second...");

                this.websocket = null;

                setTimeout(this.#initWebsocket, 1000);

                if (this.#filterTimeout !== null) {
                    clearTimeout(this.#filterTimeout);
                }

                this.#setFilters();
            } else if (event.code !== 1000) {
                this.dispatch(ONWSCLOSE_SECRET, event);
            }
        };
    }
    #initPoll() {
        this.pollingRequest = $.ajax({
            url: this.pollingPath,
            data: { last: this.lastMessage },
            success: (data) => {
                this.dispatch(data.channel, data.message);
                this.lastMessage = data.id;
                this.#initPoll();
            },
            error: (jqXHR, status) => {
                if (jqXHR.status == 504) {
                    this.#initPoll();
                } else if (jqXHR.statusText !== "abort") {
                    console.log("Long poll failure: " + status);
                    console.log(jqXHR);
                    setTimeout(this.#initPoll, 2000);
                }
            },
            dataType: "json",
        });
    }
    #initConnection() {
        if (window.WebSocket) {
            this.#initWebsocket();
        } else {
            this.#initPoll();
        }
    }
    constructor(websocketPath: string, pollingBase: string, lastMessage: number) {
        this.websocketPath = websocketPath;
        this.pollingBase = pollingBase;
        this.pollingPath = pollingBase;
        this.connected = false;
        this.lastMessage = lastMessage;
        this.events = {};
        this.channels = [];
        this.autoReconnect = false;
    }
    dispatch(eventName: string, data: any) {
        const event = this.events[eventName];
        if (event) {
            event.fire(data);
        }
    }

    on<T = any>(eventName: string, callback: Callback<T>) {
        if (!this.connected) {
            this.connected = true;
            this.#initConnection();
        }
        if (!this.events[eventName]) {
            this.events[eventName] = new Event();
            this.channels.push(eventName);

            if (this.#filterTimeout !== null) {
                clearTimeout(this.#filterTimeout);
            }
            this.#setFilters();
        }
        this.events[eventName].registerCallback(callback);
    }

    onwsclose<T = any>(callback: Callback<T>) {
        if (!this.events[ONWSCLOSE_SECRET]) {
            this.events[ONWSCLOSE_SECRET] = new Event();
        }
        this.events[ONWSCLOSE_SECRET].registerCallback(callback);
    }
}
