import Logger from "./Logger";

export default class WebSocketClient {
    logger: Logger = new Logger("websocket-client");

    url: string = "ws://127.0.0.1:8080/websocket";
    connectTimeout: number;

    connected: boolean;
    webSocket?: WebSocket;

    constructor(url: string, connectTimeout: number = 3000, connectImmediately: boolean = true) {
        this.url = url;
        this.connectTimeout = connectTimeout;

        this.connected = false;
        if (connectImmediately) {
            this.createWebSocket();
        }
    }

    createWebSocket() {
        this.logger.info("正在创建WebSocket");
        let ws = new WebSocket(this.url);
        this.addWebSocketListeners(ws);
        this.logger.info("WebSocket创建成功：", ws);
        this.webSocket = ws;
    }

    addWebSocketListeners(ws: WebSocket) {
        this.logger.info("正在绑定WebSocket事件监听");
        let self = this;
        ws.onopen = (event) => {
            self.connected = true;
            self.onOpen(event);
        };
        this.logger.debug("open事件绑定完成");
        ws.onmessage = (msgEvent: MessageEvent) => {
            self.onMessage(msgEvent);
        };
        this.logger.debug("message事件绑定完成");
        ws.onclose = (closeEvent: CloseEvent) => {
            self.connected = false;
            self.onClose(closeEvent);
        };
        this.logger.debug("close事件绑定完成");
        ws.onerror = (event: Event) => {
            self.connected = false;
            self.onError(event);
        };
        this.logger.debug("error事件绑定完成");
    }

    send(req: string) : boolean {
        if (this.webSocket == null) {
            this.logger.error("WebSocket未创建");
            return false;
        }
        if (!this.connected) {
            this.logger.error("未连接到WebSocket服务端");
            return false;
        }
        this.webSocket.send(req);
        return true;
    }

    waitForOpen() : Promise<number> {
        let self = this;
        return new Promise<number>((resolve, reject) => {
            let startAt: number = (new Date()).valueOf();
            let intervalId = setInterval(() => {
                let duration = (new Date()).valueOf() - startAt;
                if (duration >= this.connectTimeout) {
                    clearInterval(intervalId);
                    reject(`WebSocket服务端${self.url}连接超时`);
                    return;
                }
                if (self.connected) {
                    clearInterval(intervalId);
                    resolve(duration);
                }
            }, 1);
        });
    }
    
    onOpen(event: Event) {
        this.logger.info("websocket服务端连接成功: ", event);
    }

    onMessage(msgEvent: MessageEvent) {
        this.logger.info("处理服务端发送报文事件: ", msgEvent);
    }

    onClose(closeEvent: CloseEvent) {
        this.logger.info("与websocket服务端连接断开: ", closeEvent);
    }

    onError(event: Event) {
        this.logger.info("websocket通信发生错误: ", event);
    }
}