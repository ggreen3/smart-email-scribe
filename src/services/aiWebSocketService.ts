
import { emailService } from "./emailService";
import { outlookService } from "./outlookService";

type MessageType = 'user' | 'assistant';

export interface AIMessage {
  id: string;
  role: MessageType;
  content: string;
}

class AIWebSocketService {
  private socket: WebSocket | null = null;
  private messageListeners: ((message: AIMessage) => void)[] = [];
  private connectionStatusListeners: ((connected: boolean) => void)[] = [];
  private isConnected: boolean = false;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 10;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private customSystemPrompt: string = "You are an AI assistant for email management. You have access to the user's emails and can help organize, summarize, draft responses, and provide insights based on email content.";
  private pingInterval: NodeJS.Timeout | null = null;
  private webSocketUrl: string = 'wss://backend.buildpicoapps.com/api/chatbot/chat';
  private autoReconnect: boolean = true;

  constructor() {
    this.connect();
    
    // Listen for online/offline events
    window.addEventListener('online', this.handleOnline);
    window.addEventListener('offline', this.handleOffline);
  }
  
  private handleOnline = () => {
    console.log('Network connection restored. Reconnecting WebSocket...');
    this.reconnect();
  }
  
  private handleOffline = () => {
    console.log('Network connection lost. WebSocket will reconnect when online.');
    this.isConnected = false;
    this.notifyConnectionStatus(false);
    
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }

  private connect() {
    try {
      if (this.socket) {
        this.socket.close();
        this.socket = null;
      }
      
      console.log('Attempting to connect to WebSocket service at:', this.webSocketUrl);
      this.socket = new WebSocket(this.webSocketUrl);
      
      this.socket.onopen = () => {
        console.log('WebSocket connection established successfully');
        this.isConnected = true;
        this.reconnectAttempts = 0;
        this.notifyConnectionStatus(true);
        
        // Send system prompt on connection
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
          this.socket.send(JSON.stringify({
            role: 'system',
            content: this.customSystemPrompt
          }));
          console.log('System prompt sent to WebSocket');
        }
        
        // Setup ping to keep connection alive
        if (this.pingInterval) {
          clearInterval(this.pingInterval);
        }
        
        this.pingInterval = setInterval(() => {
          if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(JSON.stringify({ type: 'ping' }));
            console.log('Ping sent to keep WebSocket alive');
          }
        }, 30000); // Send ping every 30 seconds
      };
      
      this.socket.onmessage = (event) => {
        try {
          console.log('WebSocket message received:', event.data);
          const data = JSON.parse(event.data);
          
          // Check if it's a pong response
          if (data.type === 'pong') {
            console.log('Received pong from server');
            return;
          }
          
          const aiMessage: AIMessage = {
            id: Date.now().toString(),
            role: 'assistant',
            content: data.content || data.message || "I received your message but couldn't generate a response."
          };
          this.notifyMessage(aiMessage);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };
      
      this.socket.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.isConnected = false;
        this.notifyConnectionStatus(false);
      };
      
      this.socket.onclose = (event) => {
        console.log('WebSocket connection closed. Code:', event.code, 'Reason:', event.reason);
        this.isConnected = false;
        this.notifyConnectionStatus(false);
        
        // Clear ping interval
        if (this.pingInterval) {
          clearInterval(this.pingInterval);
          this.pingInterval = null;
        }
        
        // Attempt to reconnect with exponential backoff if auto-reconnect is enabled
        if (this.autoReconnect && this.reconnectAttempts < this.maxReconnectAttempts) {
          this.reconnectAttempts++;
          const delayMs = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
          console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts}) in ${delayMs/1000} seconds...`);
          
          // Clear any existing timeout
          if (this.reconnectTimeout) {
            clearTimeout(this.reconnectTimeout);
          }
          
          this.reconnectTimeout = setTimeout(() => this.connect(), delayMs);
        } else if (this.autoReconnect) {
          console.log('Maximum reconnect attempts reached. Giving up.');
          // Try one last time after a longer delay
          if (this.reconnectTimeout) {
            clearTimeout(this.reconnectTimeout);
          }
          this.reconnectTimeout = setTimeout(() => {
            this.reconnectAttempts = 0;
            this.connect();
          }, 60000); // Wait 1 minute before retrying from scratch
        }
      };
    } catch (error) {
      console.error('Failed to establish WebSocket connection:', error);
      this.isConnected = false;
      this.notifyConnectionStatus(false);
    }
  }

  public sendMessage(message: string, context?: string) {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      console.error('WebSocket is not connected. Attempting to reconnect...');
      this.connect();
      
      // Store the message and try to send it once connected
      const tempMessageHandler = (connected: boolean) => {
        if (connected) {
          setTimeout(() => {
            this.sendMessage(message, context);
            this.removeConnectionStatusListener(tempMessageHandler);
          }, 1000);
        }
      };
      
      this.addConnectionStatusListener(tempMessageHandler);
      return;
    }
    
    console.log('Sending message to WebSocket:', message);
    
    // Create a payload with email context if available
    let payload: any = {
      role: 'user',
      content: message
    };
    
    if (context) {
      payload.context = context;
      console.log('Including email context with message');
    }
    
    this.socket.send(JSON.stringify(payload));
    
    // Add user message to listeners
    const userMessage: AIMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: message
    };
    this.notifyMessage(userMessage);
  }
  
  public async sendMessageWithEmailContext(message: string) {
    try {
      console.log('Fetching email context for AI...');
      // First try to get emails from Outlook if connected
      let emails = [];
      
      if (outlookService.checkConnection()) {
        console.log('Fetching Outlook emails for AI context');
        try {
          emails = await outlookService.getEmails();
        } catch (error) {
          console.error('Error getting Outlook emails:', error);
          // Fall back to regular email service
          emails = await emailService.getEmails();
        }
      } else {
        // Fall back to regular email service
        emails = await emailService.getEmails();
      }
      
      const emailContext = emails.slice(0, 50).map(email => 
        `Subject: ${email.subject}\nFrom: ${email.sender.name} <${email.sender.email}>\nPreview: ${email.preview}`
      ).join('\n\n');
      
      console.log(`Sending message with context from ${emails.length} emails`);
      this.sendMessage(message, emailContext);
    } catch (error) {
      console.error('Error getting email context:', error);
      this.sendMessage(message);
    }
  }
  
  public setCustomSystemPrompt(prompt: string) {
    console.log('Setting custom system prompt:', prompt);
    this.customSystemPrompt = prompt;
    
    // If connected, send the updated system prompt
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({
        role: 'system',
        content: prompt
      }));
      console.log('System prompt updated and sent to WebSocket');
    }
  }
  
  public addMessageListener(listener: (message: AIMessage) => void) {
    this.messageListeners.push(listener);
  }
  
  public removeMessageListener(listener: (message: AIMessage) => void) {
    this.messageListeners = this.messageListeners.filter(l => l !== listener);
  }
  
  public addConnectionStatusListener(listener: (connected: boolean) => void) {
    this.connectionStatusListeners.push(listener);
    // Immediately notify with current status
    listener(this.isConnected);
  }
  
  public removeConnectionStatusListener(listener: (connected: boolean) => void) {
    this.connectionStatusListeners = this.connectionStatusListeners.filter(l => l !== listener);
  }
  
  private notifyMessage(message: AIMessage) {
    this.messageListeners.forEach(listener => listener(message));
  }
  
  private notifyConnectionStatus(connected: boolean) {
    this.connectionStatusListeners.forEach(listener => listener(connected));
  }
  
  public isWebSocketConnected(): boolean {
    return this.isConnected;
  }
  
  public reconnect() {
    console.log("Manually triggering WebSocket reconnection");
    this.reconnectAttempts = 0;
    this.autoReconnect = true;
    if (this.socket) {
      this.socket.close();
    }
    this.connect();
  }
  
  public pauseReconnect() {
    this.autoReconnect = false;
    console.log("Auto-reconnect has been paused");
  }
  
  public resumeReconnect() {
    this.autoReconnect = true;
    console.log("Auto-reconnect has been resumed");
  }
  
  public close() {
    window.removeEventListener('online', this.handleOnline);
    window.removeEventListener('offline', this.handleOffline);
    
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
    
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    
    this.autoReconnect = false;
  }
}

// Create a singleton instance
export const aiWebSocketService = new AIWebSocketService();
