
// This service handles WebSocket connections to the AI service
// It maintains the connection and exposes methods to send and receive messages

import { v4 as uuidv4 } from 'uuid';

export interface AIMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

class AIWebSocketService {
  private webSocket: WebSocket | null = null;
  private isConnected: boolean = false;
  private connectionListeners: Array<(connected: boolean) => void> = [];
  private messageListeners: Array<(message: AIMessage) => void> = [];
  private reconnectTimeout: number | null = null;
  private reconnectAttempts: number = 0;
  private pingInterval: number | null = null;
  private systemPrompt: string = "You are an AI assistant for email management in Outlook. You have access to the user's emails and can help organize, summarize, draft responses, and provide insights based on email content. You can analyze email patterns, suggest responses, and identify important emails in the user's inbox. Be concise but thorough in your responses.";

  constructor() {
    console.log("AI WebSocket Service initialized");
    this.connect();

    // Add event listener for online/offline events
    window.addEventListener('online', this.handleOnline);
    window.addEventListener('offline', this.handleOffline);
  }

  private handleOnline = () => {
    console.log("Browser is online. Reconnecting WebSocket...");
    if (!this.isWebSocketConnected()) {
      this.reconnect();
    }
  };

  private handleOffline = () => {
    console.log("Browser is offline. WebSocket will be reconnected when online.");
    this.notifyConnectionStatus(false);
  };

  public connect() {
    if (this.webSocket) {
      console.log("WebSocket already exists, closing before reconnecting");
      this.webSocket.close();
      this.webSocket = null;
    }

    try {
      // Use the provided WebSocket URL
      const wsUrl = "wss://backend.buildpicoapps.com/api/chatbot/chat";
      console.log("Connecting to WebSocket:", wsUrl);
      
      this.webSocket = new WebSocket(wsUrl);
      
      this.webSocket.onopen = () => {
        console.log("WebSocket connection established");
        this.isConnected = true;
        this.reconnectAttempts = 0;
        this.notifyConnectionStatus(true);
        this.startPingInterval();
        
        // Send system prompt when connected
        this.sendSystemPrompt();
      };
      
      this.webSocket.onmessage = (event) => {
        console.log("WebSocket message received:", event.data);
        
        try {
          // Parse the message data
          const data = JSON.parse(event.data);
          
          // Create an AIMessage from the response
          const message: AIMessage = {
            id: uuidv4(),
            role: 'assistant',
            content: data.message || data.content || event.data,
          };
          
          // Notify listeners of the new message
          this.notifyMessage(message);
        } catch (error) {
          console.error("Error parsing WebSocket message:", error);
          
          // If parsing fails, try to use the raw message
          if (typeof event.data === 'string') {
            const message: AIMessage = {
              id: uuidv4(),
              role: 'assistant',
              content: event.data,
            };
            this.notifyMessage(message);
          }
        }
      };
      
      this.webSocket.onclose = (event) => {
        console.log("WebSocket connection closed:", event.code, event.reason);
        this.isConnected = false;
        this.notifyConnectionStatus(false);
        this.stopPingInterval();
        
        // Reconnect if closure wasn't intentional
        if (event.code !== 1000) {
          this.scheduleReconnect();
        }
      };
      
      this.webSocket.onerror = (error) => {
        console.error("WebSocket error:", error);
        this.isConnected = false;
        this.notifyConnectionStatus(false);
        
        // Close the connection on error and schedule reconnect
        if (this.webSocket) {
          this.webSocket.close();
        }
      };
    } catch (error) {
      console.error("Error creating WebSocket:", error);
      this.isConnected = false;
      this.notifyConnectionStatus(false);
      this.scheduleReconnect();
    }
  }

  private startPingInterval() {
    this.stopPingInterval(); // Clear any existing interval
    
    // Send a ping every 30 seconds to verify connection
    this.pingInterval = window.setInterval(() => {
      this.sendPing();
    }, 30000);
  }
  
  private stopPingInterval() {
    if (this.pingInterval !== null) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }
  
  private sendPing() {
    if (this.isWebSocketConnected()) {
      try {
        this.webSocket?.send(JSON.stringify({ type: "ping" }));
        console.log("Ping sent to verify connection");
      } catch (error) {
        console.error("Error sending ping:", error);
        this.notifyConnectionStatus(false);
        this.reconnect();
      }
    }
  }

  private scheduleReconnect() {
    if (this.reconnectTimeout !== null) {
      clearTimeout(this.reconnectTimeout);
    }
    
    this.reconnectAttempts += 1;
    
    // Exponential backoff with maximum of 30 seconds
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
    console.log(`Scheduling WebSocket reconnect in ${delay}ms (attempt ${this.reconnectAttempts})`);
    
    this.reconnectTimeout = window.setTimeout(() => {
      console.log(`Reconnecting WebSocket (attempt ${this.reconnectAttempts})`);
      this.connect();
    }, delay);
  }

  public reconnect() {
    console.log("Forcing WebSocket reconnection");
    
    // Clear existing reconnect timeout if any
    if (this.reconnectTimeout !== null) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    
    // Close existing connection if any
    if (this.webSocket) {
      this.webSocket.close();
      this.webSocket = null;
    }
    
    // Connect immediately
    this.reconnectAttempts = 0;
    this.connect();
  }

  public addConnectionStatusListener(listener: (connected: boolean) => void) {
    this.connectionListeners.push(listener);
    // Immediately notify with current status
    listener(this.isConnected);
  }

  public removeConnectionStatusListener(listener: (connected: boolean) => void) {
    this.connectionListeners = this.connectionListeners.filter(l => l !== listener);
  }

  private notifyConnectionStatus(connected: boolean) {
    this.isConnected = connected;
    this.connectionListeners.forEach(listener => listener(connected));
  }

  public addMessageListener(listener: (message: AIMessage) => void) {
    this.messageListeners.push(listener);
  }

  public removeMessageListener(listener: (message: AIMessage) => void) {
    this.messageListeners = this.messageListeners.filter(l => l !== listener);
  }

  private notifyMessage(message: AIMessage) {
    this.messageListeners.forEach(listener => listener(message));
  }

  public sendMessage(content: string, context: string = "") {
    if (!this.isWebSocketConnected()) {
      console.error("Cannot send message - WebSocket not connected");
      return false;
    }
    
    try {
      const message: AIMessage = {
        id: uuidv4(),
        role: 'user',
        content: content,
      };
      
      // Create the WebSocket payload to send
      const payload = {
        message: content,
        context: context || undefined
      };
      
      // Send the message
      this.webSocket?.send(JSON.stringify(payload));
      console.log("Message sent to AI service:", payload);
      
      // Notify local listeners of the user message
      this.notifyMessage(message);
      
      return true;
    } catch (error) {
      console.error("Error sending message:", error);
      return false;
    }
  }

  // Implementation of the sendMessageWithEmailContext method
  public sendMessageWithEmailContext(content: string, emailContext: string = "") {
    console.log("Sending message with email context:", content);
    return this.sendMessage(content, emailContext);
  }

  private sendSystemPrompt() {
    if (!this.isWebSocketConnected()) {
      console.error("Cannot send system prompt - WebSocket not connected");
      return false;
    }
    
    try {
      const systemMessage = {
        type: "system",
        message: this.systemPrompt,
      };
      
      this.webSocket?.send(JSON.stringify(systemMessage));
      console.log("System prompt sent to AI service:", this.systemPrompt);
      return true;
    } catch (error) {
      console.error("Error sending system prompt:", error);
      return false;
    }
  }

  public setCustomSystemPrompt(prompt: string) {
    console.log("Setting custom system prompt:", prompt);
    this.systemPrompt = prompt;
    
    // If connected, send the new system prompt immediately
    if (this.isWebSocketConnected()) {
      this.sendSystemPrompt();
    }
  }

  public getSystemPrompt(): string {
    return this.systemPrompt;
  }

  public isWebSocketConnected(): boolean {
    return this.webSocket !== null && this.webSocket.readyState === WebSocket.OPEN;
  }

  public cleanup() {
    console.log("Cleaning up AI WebSocket Service");
    
    window.removeEventListener('online', this.handleOnline);
    window.removeEventListener('offline', this.handleOffline);
    
    this.stopPingInterval();
    
    if (this.reconnectTimeout !== null) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    
    if (this.webSocket) {
      this.webSocket.close();
      this.webSocket = null;
    }
    
    this.connectionListeners = [];
    this.messageListeners = [];
  }
}

export const aiWebSocketService = new AIWebSocketService();
