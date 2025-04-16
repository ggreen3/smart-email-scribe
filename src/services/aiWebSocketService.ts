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
  private customSystemPrompt: string = "You are an AI assistant for email management in Outlook. You have access to the user's emails and can help organize, summarize, draft responses, and provide insights based on email content. You can analyze email patterns, suggest responses, and identify important emails in the user's inbox. Be concise but thorough in your responses.";
  private pingInterval: NodeJS.Timeout | null = null;
  private webSocketUrl: string = 'wss://backend.buildpicoapps.com/api/chatbot/chat';
  private autoReconnect: boolean = true;
  private lastConnectionAttempt: number = 0;
  private connectionCooldown: number = 3000; // 3 second cooldown between connection attempts
  private pingFailCount: number = 0;
  private maxPingFailCount: number = 3;
  private lastPingTime: number = 0;
  private socketInitialized: boolean = false;

  constructor() {
    console.log('Initializing AI WebSocket Service with enhanced reliability');
    
    // Initialize with a slight delay to allow other services to set up
    setTimeout(() => {
      this.connect();
      
      // Send the system prompt again after initial connection stabilizes
      setTimeout(() => {
        this.refreshSystemPrompt();
      }, 5000);
    }, 1000);
    
    // Listen for online/offline events
    window.addEventListener('online', this.handleOnline);
    window.addEventListener('offline', this.handleOffline);
    
    // Schedule periodic reconnection check
    setInterval(() => this.checkConnectionStatus(), 30000);
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
  
  private refreshSystemPrompt() {
    if (this.isConnected && this.socket && this.socket.readyState === WebSocket.OPEN) {
      try {
        this.socket.send(JSON.stringify({
          role: 'system',
          content: this.customSystemPrompt
        }));
        console.log('Refreshed system prompt sent to WebSocket');
      } catch (error) {
        console.error('Error refreshing system prompt:', error);
      }
    }
  }
  
  private checkConnectionStatus() {
    if (!this.isConnected && this.autoReconnect) {
      console.log('Periodic connection check: AI WebSocket disconnected, attempting to reconnect...');
      this.reconnect();
    } else if (this.isConnected) {
      console.log('Periodic connection check: AI WebSocket is connected');
      // Send a ping to verify the connection is actually working
      this.sendPing();
    }
  }
  
  private sendPing() {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      try {
        this.lastPingTime = Date.now();
        this.socket.send(JSON.stringify({ type: 'ping' }));
        console.log('Ping sent to verify WebSocket connection');
      } catch (error) {
        console.error('Error sending verification ping:', error);
        this.pingFailCount++;
        
        if (this.pingFailCount >= this.maxPingFailCount) {
          console.log('Multiple ping failures detected, reconnecting WebSocket');
          this.pingFailCount = 0;
          this.reconnect();
        }
      }
    }
  }

  private connect() {
    try {
      // Check if we're in a connection cooldown period
      const now = Date.now();
      if (now - this.lastConnectionAttempt < this.connectionCooldown) {
        console.log('Connection attempt throttled, waiting for cooldown period');
        
        if (this.reconnectTimeout) {
          clearTimeout(this.reconnectTimeout);
        }
        
        this.reconnectTimeout = setTimeout(() => this.connect(), 
          this.connectionCooldown - (now - this.lastConnectionAttempt));
        return;
      }
      
      this.lastConnectionAttempt = now;
      
      if (this.socket) {
        try {
          this.socket.close();
        } catch (e) {
          console.error('Error closing existing socket:', e);
        }
        this.socket = null;
      }
      
      console.log('Attempting to connect to WebSocket service at:', this.webSocketUrl);
      
      try {
        this.socket = new WebSocket(this.webSocketUrl);
        this.socketInitialized = true;
      } catch (error) {
        console.error('Error creating WebSocket:', error);
        this.handleConnectionFailure();
        return;
      }
      
      this.socket.onopen = () => {
        console.log('WebSocket connection established successfully');
        this.isConnected = true;
        this.reconnectAttempts = 0;
        this.pingFailCount = 0;
        this.notifyConnectionStatus(true);
        
        // Send system prompt on connection
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
          try {
            this.socket.send(JSON.stringify({
              role: 'system',
              content: this.customSystemPrompt
            }));
            console.log('System prompt sent to WebSocket:', this.customSystemPrompt.substring(0, 50) + '...');
          } catch (error) {
            console.error('Error sending system prompt:', error);
          }
        }
        
        // Setup ping to keep connection alive
        if (this.pingInterval) {
          clearInterval(this.pingInterval);
        }
        
        this.pingInterval = setInterval(() => {
          if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            try {
              this.lastPingTime = Date.now();
              this.socket.send(JSON.stringify({ type: 'ping' }));
              console.log('Ping sent to keep WebSocket alive');
            } catch (error) {
              console.error('Error sending ping:', error);
              this.pingFailCount++;
              
              if (this.pingFailCount >= this.maxPingFailCount) {
                console.log('Multiple ping failures detected, reconnecting WebSocket');
                this.pingFailCount = 0;
                this.reconnect();
              }
            }
          } else {
            // Socket is not open, attempt to reconnect
            console.log('Ping interval detected closed WebSocket, attempting to reconnect');
            this.reconnect();
          }
        }, 30000); // Send ping every 30 seconds
      };
      
      this.socket.onmessage = (event) => {
        try {
          console.log('WebSocket message received:', event.data);
          const data = JSON.parse(event.data);
          
          // Check if it's a pong response
          if (data.type === 'pong') {
            console.log('Received pong from server, connection verified');
            const pingLatency = Date.now() - this.lastPingTime;
            console.log(`Ping latency: ${pingLatency}ms`);
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
        this.handleConnectionFailure();
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
        
        this.handleConnectionFailure();
      };
    } catch (error) {
      console.error('Failed to establish WebSocket connection:', error);
      this.isConnected = false;
      this.notifyConnectionStatus(false);
      this.handleConnectionFailure();
    }
  }
  
  private handleConnectionFailure() {
    // Attempt to reconnect with exponential backoff if auto-reconnect is enabled
    if (this.autoReconnect && this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delayMs = Math.min(1000 * Math.pow(1.5, this.reconnectAttempts), 20000);
      console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts}) in ${delayMs/1000} seconds...`);
      
      // Clear any existing timeout
      if (this.reconnectTimeout) {
        clearTimeout(this.reconnectTimeout);
      }
      
      this.reconnectTimeout = setTimeout(() => this.connect(), delayMs);
    } else if (this.autoReconnect) {
      console.log('Maximum reconnect attempts reached. Taking a longer break before trying again.');
      // Try one last time after a longer delay
      if (this.reconnectTimeout) {
        clearTimeout(this.reconnectTimeout);
      }
      this.reconnectTimeout = setTimeout(() => {
        this.reconnectAttempts = 0;
        this.connect();
      }, 60000); // Wait 1 minute before retrying from scratch
    }
  }

  public sendMessage(message: string, context?: string) {
    // Try to connect if not connected
    if (!this.socketInitialized || !this.socket || this.socket.readyState !== WebSocket.OPEN) {
      console.error('WebSocket is not connected. Attempting to reconnect...');
      this.reconnect();
      
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
      
      // Immediately return a temporary message to the user
      const tempMessage: AIMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: "Connecting to AI service... Your message will be processed as soon as the connection is established."
      };
      this.notifyMessage(tempMessage);
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
    
    try {
      this.socket.send(JSON.stringify(payload));
      
      // Add user message to listeners
      const userMessage: AIMessage = {
        id: Date.now().toString(),
        role: 'user',
        content: message
      };
      this.notifyMessage(userMessage);
    } catch (error) {
      console.error('Error sending message to WebSocket:', error);
      
      // If sending fails, attempt to reconnect
      this.reconnect();
      
      // Return a fallback message to the user
      const errorMessage: AIMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: "I'm having trouble connecting to the AI service. Please try again in a moment."
      };
      this.notifyMessage(errorMessage);
    }
  }
  
  public async sendMessageWithEmailContext(message: string) {
    try {
      console.log('Fetching email context for AI...');
      // First try to get emails from Outlook if connected
      let emails = [];
      let emailError = null;
      
      if (outlookService.checkConnection()) {
        console.log('Fetching Outlook emails for AI context');
        try {
          // Limit the number of emails fetched to prevent overload
          const limit = 20;
          emails = await outlookService.getEmails();
          emails = emails.slice(0, limit);
        } catch (error) {
          console.error('Error getting Outlook emails:', error);
          emailError = error;
          // Don't fall back right away, try a more controlled approach
        }
      }
      
      // If Outlook failed or returned no emails, try the regular email service
      if (emails.length === 0) {
        try {
          console.log('Fetching emails from email service as fallback');
          emails = await emailService.getEmails();
          emails = emails.slice(0, 20); // Limit to prevent payload issues
        } catch (error) {
          console.error('Error getting emails from email service:', error);
          // If both methods fail, proceed without context
          if (emailError) {
            console.error('Both Outlook and email service failed to fetch emails');
          }
        }
      }
      
      // If we have emails, build the context and send
      if (emails && emails.length > 0) {
        const emailContext = emails.map(email => 
          `Subject: ${email.subject}\nFrom: ${email.sender.name} <${email.sender.email}>\nPreview: ${email.preview}`
        ).join('\n\n');
        
        console.log(`Sending message with context from ${emails.length} emails`);
        this.sendMessage(message, emailContext);
      } else {
        // If no emails could be fetched, send message without context
        console.log('Sending message without email context due to fetch failures');
        this.sendMessage(message);
        
        // Notify the user about the issue
        const errorMessage: AIMessage = {
          id: Date.now().toString(),
          role: 'assistant',
          content: "I couldn't access your emails for context. I'll try to assist based on your message alone."
        };
        this.notifyMessage(errorMessage);
      }
    } catch (error) {
      console.error('Error in sendMessageWithEmailContext:', error);
      this.sendMessage(message);
    }
  }
  
  public setCustomSystemPrompt(prompt: string) {
    console.log('Setting custom system prompt:', prompt);
    this.customSystemPrompt = prompt;
    
    // If connected, send the updated system prompt
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      try {
        this.socket.send(JSON.stringify({
          role: 'system',
          content: prompt
        }));
        console.log('System prompt updated and sent to WebSocket');
      } catch (error) {
        console.error('Error sending updated system prompt:', error);
      }
    }
  }
  
  public getSystemPrompt(): string {
    return this.customSystemPrompt;
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
    this.messageListeners.forEach(listener => {
      try {
        listener(message);
      } catch (error) {
        console.error('Error in message listener:', error);
      }
    });
  }
  
  private notifyConnectionStatus(connected: boolean) {
    this.connectionStatusListeners.forEach(listener => {
      try {
        listener(connected);
      } catch (error) {
        console.error('Error in connection status listener:', error);
      }
    });
  }
  
  public isWebSocketConnected(): boolean {
    return this.isConnected;
  }
  
  public reconnect() {
    console.log("Manually triggering WebSocket reconnection");
    this.reconnectAttempts = 0;
    this.pingFailCount = 0;
    this.autoReconnect = true;
    
    if (this.socket) {
      try {
        this.socket.close();
      } catch (e) {
        console.error('Error closing socket during reconnect:', e);
      }
      this.socket = null;
    }
    
    // Clear any existing reconnect timeout
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    
    // Immediate reconnection attempt
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
      try {
        this.socket.close();
      } catch (e) {
        console.error('Error closing socket during service shutdown:', e);
      }
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
