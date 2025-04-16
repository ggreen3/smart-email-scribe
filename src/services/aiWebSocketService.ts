
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
  private lastPingTime: number = 0;
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
      // In a real app, this would be your AI service endpoint
      const wsUrl = "wss://echo.websocket.org"; // Echo service for demo
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
          // Handle ping/pong for connection verification
          if (event.data === "pong") {
            console.log("Received pong response, connection verified");
            this.lastPingTime = Date.now();
            return;
          }
          
          // Handle normal messages
          const message = JSON.parse(event.data);
          
          // Echo service will just return what we sent, so in a real implementation 
          // you would transform the response here
          if (message.role === 'user') {
            // For demo: Echo service returns what we send, so we simulate AI response
            setTimeout(() => {
              this.simulateAIResponse(message.content);
            }, 1000);
          } else {
            this.notifyMessage(message);
          }
        } catch (error) {
          console.error("Error parsing WebSocket message:", error);
          
          // For demo: If message isn't JSON, simulate response based on text
          if (typeof event.data === 'string') {
            setTimeout(() => {
              this.simulateAIResponse(event.data);
            }, 1000);
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
    
    // Initial ping to verify connection immediately
    this.sendPing();
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
        this.webSocket?.send("ping");
        console.log("Ping sent to verify connection");
        this.lastPingTime = Date.now();
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
      
      // Add context if provided
      const messageWithContext = context 
        ? { ...message, content: `${content}\n\nCONTEXT:\n${context}` } 
        : message;
      
      this.webSocket?.send(JSON.stringify(messageWithContext));
      console.log("Message sent to AI service:", messageWithContext);
      
      // Notify local listeners of the user message
      this.notifyMessage(message);
      
      return true;
    } catch (error) {
      console.error("Error sending message:", error);
      return false;
    }
  }

  private sendSystemPrompt() {
    if (!this.isWebSocketConnected()) {
      console.error("Cannot send system prompt - WebSocket not connected");
      return false;
    }
    
    try {
      const systemMessage = {
        role: 'system',
        content: this.systemPrompt,
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

  // For demo purposes only - simulates AI responses in echo service
  private simulateAIResponse(userContent: string) {
    const assistantResponse: AIMessage = {
      id: uuidv4(),
      role: 'assistant',
      content: this.generateMockResponse(userContent),
    };
    
    this.notifyMessage(assistantResponse);
  }
  
  // Generate a mock response based on user input for demo
  private generateMockResponse(userContent: string): string {
    if (userContent.toLowerCase().includes("summarize")) {
      return "Here's a summary of the email:\n\n• The sender is discussing a project update\n• They've completed the initial phase\n• There are action items that need to be addressed\n• They've attached relevant documents for review";
    } else if (userContent.toLowerCase().includes("draft")) {
      return "Here's a draft response:\n\nThank you for your email. I have received the documents and will review them promptly. I'll get back to you with my feedback by the end of the week.\n\nBest regards,\n[Your Name]";
    } else if (userContent.toLowerCase().includes("analyze")) {
      return "Email Analysis:\n\nThis appears to be a work-related email with medium priority. The sender expects a response or acknowledgment. The tone is professional and direct. There are 2 action items mentioned that require your attention within the next 48 hours.";
    } else if (userContent.toLowerCase().includes("important")) {
      return "Based on the content, this email is important as it contains:\n\n1. Time-sensitive information about a deadline\n2. Requests for your input on key decisions\n3. Information needed for an upcoming meeting";
    } else {
      return "I've analyzed the email you shared. It appears to be about a business matter that requires your attention. Would you like me to summarize the key points, draft a response, or analyze the tone and urgency of this message?";
    }
  }
}

export const aiWebSocketService = new AIWebSocketService();
