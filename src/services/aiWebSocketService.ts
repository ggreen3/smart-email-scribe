
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
  private customSystemPrompt: string = "You are an AI assistant for email management. You have access to the user's emails and can help organize, summarize, and draft responses.";

  constructor() {
    this.connect();
  }

  private connect() {
    try {
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
        this.notifyConnectionStatus(false);
      };
      
      this.socket.onclose = () => {
        console.log('WebSocket connection closed');
        this.isConnected = false;
        this.notifyConnectionStatus(false);
        
        // Attempt to reconnect
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
          this.reconnectAttempts++;
          console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
          setTimeout(() => this.connect(), 3000);
        }
      };
    } catch (error) {
      console.error('Failed to establish WebSocket connection:', error);
    }
  }

  public sendMessage(message: string, context?: string) {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      console.error('WebSocket is not connected');
      this.connect();
      return;
    }
    
    // Create a payload with email context if available
    let payload: any = {
      role: 'user',
      content: message
    };
    
    if (context) {
      payload.context = context;
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
      // Get recent emails for context
      const emails = await emailService.getEmails();
      const emailContext = emails.slice(0, 5).map(email => 
        `Subject: ${email.subject}\nFrom: ${email.sender.name} <${email.sender.email}>\nPreview: ${email.preview}`
      ).join('\n\n');
      
      this.sendMessage(message, emailContext);
    } catch (error) {
      console.error('Error getting email context:', error);
      this.sendMessage(message);
    }
  }
  
  public setCustomSystemPrompt(prompt: string) {
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
  
  public close() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }
}

// Create a singleton instance
export const aiWebSocketService = new AIWebSocketService();
