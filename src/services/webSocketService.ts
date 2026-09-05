export type WebSocketMessageHandler = (data: any) => void;

class WebSocketService {
  private ws: WebSocket | null = null;
  private url: string;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private handlers: Map<string, Set<WebSocketMessageHandler>> = new Map();

  constructor() {
    // Determine WS URL based on current host
    const host = window.location.hostname;
    const port = 5000; // backend port
    this.url = `ws://${host}:${port}/ws/telemetry`;
  }

  connect() {
    if (this.ws?.readyState === WebSocket.OPEN || this.ws?.readyState === WebSocket.CONNECTING) {
      return;
    }

    try {
      this.ws = new WebSocket(this.url);

      this.ws.onopen = () => {
        console.log('[WebSocket] Connected to telemetry server');
        this.reconnectAttempts = 0;
      };

      this.ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          if (message.type) {
            this.emit(message.type, message.data);
          }
        } catch (err) {
          console.error('[WebSocket] Failed to parse message', err);
        }
      };

      this.ws.onclose = () => {
        console.log('[WebSocket] Disconnected');
        this.handleReconnect();
      };

      this.ws.onerror = (err) => {
        console.error('[WebSocket] Error', err);
      };
    } catch (error) {
      console.error('[WebSocket] Connection failed', error);
      this.handleReconnect();
    }
  }

  private handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const timeout = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 10000);
      console.log(`[WebSocket] Reconnecting in ${timeout}ms... (Attempt ${this.reconnectAttempts})`);
      setTimeout(() => this.connect(), timeout);
    } else {
      console.error('[WebSocket] Max reconnect attempts reached');
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  subscribe(eventType: string, handler: WebSocketMessageHandler) {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, new Set());
    }
    this.handlers.get(eventType)?.add(handler);
    
    // Return unsubscribe function
    return () => {
      this.handlers.get(eventType)?.delete(handler);
    };
  }

  private emit(eventType: string, data: any) {
    const typeHandlers = this.handlers.get(eventType);
    if (typeHandlers) {
      typeHandlers.forEach(handler => handler(data));
    }
  }
}

export const webSocketService = new WebSocketService();
