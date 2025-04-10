
import { emailService } from "./emailService";

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
  private maxReconnectAttempts: number = 5;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private customSystemPrompt: string = "You are an AI assistant for email management. You have access to the user's emails and can help organize, summarize, and draft responses.";

  constructor() {
    this.connect();
  }

  private connect() {
    try {
      console.log('Attempting to connect to WebSocket service...');
      // Use the direct WebSocket URL provided
      this.socket = new WebSocket('wss://backend.buildpicoapps.com/api/chatbot/chat');
      
      this.socket.onopen = () => {
        console.log('WebSocket connection established');
        this.isConnected = true;
        this.reconnectAttempts = 0;
        this.notifyConnectionStatus(true);
        
        // Send system prompt on connection
        if (this.socket) {
          this.socket.send(JSON.stringify({
            role: 'system',
            content: this.customSystemPrompt
          }));
        }
      };
      
      this.socket.onmessage = (event) => {
        try {
          console.log('WebSocket message received:', event.data);
          const data = JSON.parse(event.data);
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
        
        // Attempt to reconnect
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
          this.reconnectAttempts++;
          console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
          
          // Clear any existing timeout
          if (this.reconnectTimeout) {
            clearTimeout(this.reconnectTimeout);
          }
          
          this.reconnectTimeout = setTimeout(() => this.connect(), 3000);
        } else {
          console.log('Maximum reconnect attempts reached. Giving up.');
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
      // Get recent emails for context
      const emails = await emailService.getEmails();
      const emailContext = emails.slice(0, 5).map(email => 
        `Subject: ${email.subject}\nFrom: ${email.sender.name} <${email.sender.email}>\nPreview: ${email.preview}`
      ).join('\n\n');
      
      console.log('Sending message with email context');
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
    if (this.socket) {
      this.socket.close();
    }
    this.connect();
  }
  
  public close() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
  }
}

// Create a singleton instance
export const aiWebSocketService = new AIWebSocketService();
