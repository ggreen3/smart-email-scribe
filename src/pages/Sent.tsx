
import { useState, useEffect } from "react";
import { Send, Paperclip, Star, Archive, Trash2, Loader2, Brain } from "lucide-react";
import EmailSidebar from "@/components/EmailSidebar";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { emailService } from "@/services/emailService";
import { outlookService } from "@/services/outlookService";
import { useToast } from "@/hooks/use-toast";
import { EmailPreview } from "@/types/email";
import { Textarea } from "@/components/ui/textarea";
import { aiWebSocketService, AIMessage } from "@/services/aiWebSocketService";

export default function Sent() {
  const [isOutlookConnected, setIsOutlookConnected] = useState(false);
  const [emails, setEmails] = useState<EmailPreview[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAIChat, setShowAIChat] = useState(false);
  const [inputMessage, setInputMessage] = useState("");
  const [chatMessages, setChatMessages] = useState<AIMessage[]>([
    { id: '1', role: 'assistant', content: 'Hello! I can help you with your emails. What would you like to know? 😊' }
  ]);
  const [isConnected, setIsConnected] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Check if Outlook is connected
    const connected = outlookService.checkConnection();
    setIsOutlookConnected(connected);
    
    // Check AI connection status
    const aiConnected = aiWebSocketService.isWebSocketConnected();
    setIsConnected(aiConnected);
    
    // Setup AI connection listeners
    const handleConnectionStatus = (connected: boolean) => {
      setIsConnected(connected);
    };
    
    const handleMessage = (message: AIMessage) => {
      setChatMessages(prev => [...prev, message]);
      if (message.role === 'assistant') {
        setIsSending(false);
      }
    };
    
    aiWebSocketService.addConnectionStatusListener(handleConnectionStatus);
    aiWebSocketService.addMessageListener(handleMessage);
    
    // Fetch sent emails
    const fetchSentEmails = async () => {
      try {
        setLoading(true);
        toast({
          title: "Loading Sent Emails",
          description: "Retrieving your sent emails...",
        });
        
        const data = await emailService.getSentEmails();
        setEmails(data);
        
        toast({
          title: "Emails Loaded",
          description: `Retrieved ${data.length} sent emails.`,
        });
      } catch (error) {
        console.error("Error fetching sent emails:", error);
        toast({
          title: "Error",
          description: "Failed to load sent emails. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchSentEmails();
    
    // Cleanup listeners
    return () => {
      aiWebSocketService.removeConnectionStatusListener(handleConnectionStatus);
      aiWebSocketService.removeMessageListener(handleMessage);
    };
  }, []);

  const handleArchive = (id: string) => {
    setEmails(emails.filter(email => email.id !== id));
    toast({
      title: "Email archived ✅",
      description: "The email has been moved to the archive folder.",
    });
  };

  const handleDelete = (id: string) => {
    setEmails(emails.filter(email => email.id !== id));
    toast({
      title: "Email deleted ✅",
      description: "The email has been moved to the trash folder.",
    });
  };

  const toggleStar = (id: string) => {
    setEmails(emails.map(email => 
      email.id === id ? { ...email, isStarred: !email.isStarred } : email
    ));
  };
  
  const sendMessage = () => {
    if (!inputMessage.trim() || !isConnected) return;
    
    // Create a context about the sent emails
    const emailContext = `The user is viewing their sent emails. They have ${emails.length} sent emails. The most recent ones include: ${emails.slice(0, 3).map(e => e.subject).join(", ")}.`;
    
    setIsSending(true);
    aiWebSocketService.sendMessageWithEmailContext(inputMessage, emailContext);
    setInputMessage("");
  };

  return (
    <div className="flex h-screen overflow-hidden bg-email-background">
      <EmailSidebar />
      <div className="flex-1 overflow-auto">
        <div className="p-6">
          <div className="flex items-center mb-6 justify-between">
            <div className="flex items-center">
              <Send className="h-6 w-6 mr-2 text-blue-500" />
              <h1 className="text-2xl font-bold">Sent Emails 📤</h1>
              {isOutlookConnected && (
                <Badge variant="outline" className="ml-3 bg-blue-50 text-blue-600">
                  Outlook Connected ✅
                </Badge>
              )}
            </div>
            <Button 
              variant={showAIChat ? "default" : "outline"}
              onClick={() => setShowAIChat(!showAIChat)}
              className="flex items-center gap-2"
            >
              <Brain className="h-4 w-4" />
              {showAIChat ? "Hide AI Chat" : "Show AI Chat"}
            </Button>
          </div>
          
          {showAIChat && (
            <div className="mb-6 p-4 border rounded-md bg-card">
              <h2 className="text-lg font-semibold mb-3 flex items-center">
                <Brain className="h-5 w-5 mr-2 text-blue-500" />
                AI Assistant 🤖
              </h2>
              
              <div className="bg-muted/50 rounded-md p-3 mb-3 max-h-[300px] overflow-y-auto">
                {chatMessages.map((msg) => (
                  <div 
                    key={msg.id} 
                    className={cn(
                      "mb-2 p-2 rounded-md",
                      msg.role === 'user' ? "bg-blue-100 ml-8" : "bg-gray-100 mr-8"
                    )}
                  >
                    <p className="text-sm">{msg.content}</p>
                  </div>
                ))}
                {isSending && (
                  <div className="flex items-center justify-center p-2">
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    <span className="text-sm">AI is thinking...</span>
                  </div>
                )}
              </div>
              
              <div className="flex gap-2">
                <Textarea
                  placeholder="Ask a question about your sent emails..."
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  className="flex-1"
                  disabled={!isConnected || isSending}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                />
                <Button 
                  onClick={sendMessage} 
                  disabled={!inputMessage.trim() || !isConnected || isSending}
                >
                  {isSending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
              
              {!isConnected && (
                <p className="text-sm text-destructive mt-2">
                  AI service is currently disconnected. Please try again later.
                </p>
              )}
            </div>
          )}
          
          {loading ? (
            <div className="flex items-center justify-center p-12">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500 mx-auto mb-2" />
                <p>Loading sent emails...</p>
              </div>
            </div>
          ) : emails.length > 0 ? (
            <div className="space-y-4">
              {emails.map((email) => (
                <Card key={email.id} className="hover:shadow-sm transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <Avatar className="h-10 w-10 mt-1">
                        <AvatarImage src={email.sender.avatar} alt={email.sender.name} />
                        <AvatarFallback>{email.sender.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-medium truncate">{email.subject}</h3>
                          <span className="text-xs text-email-text-muted whitespace-nowrap ml-2">
                            {email.time}
                          </span>
                        </div>
                        
                        <p className="text-sm text-email-text-secondary mb-2">
                          {email.preview.includes("To:") ? email.preview : `To: ${email.preview}`}
                        </p>
                        
                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center space-x-1">
                            {email.hasAttachments && (
                              <Badge variant="outline" className="text-xs">
                                <Paperclip className="h-3 w-3 mr-1" />
                                Attachments 📎
                              </Badge>
                            )}
                            <Badge variant="outline" className="text-xs">
                              {email.date}
                            </Badge>
                          </div>
                          
                          <div className="flex space-x-1">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 w-8 p-0"
                              onClick={() => toggleStar(email.id)}
                            >
                              <Star className={cn(
                                "h-4 w-4",
                                email.isStarred && "fill-yellow-400 text-yellow-400"
                              )} />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => handleArchive(email.id)}
                            >
                              <Archive className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => handleDelete(email.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 px-4 bg-gray-50 rounded-lg">
              <Send className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-1">No sent emails 📭</h3>
              <p className="text-sm text-gray-500 text-center max-w-md">
                Your sent folder is empty. Messages you send will appear here.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
