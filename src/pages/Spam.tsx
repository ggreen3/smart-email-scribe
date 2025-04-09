
import { useState, useEffect } from "react";
import { Shield, TrashIcon, Mail, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import EmailSidebar from "@/components/EmailSidebar";
import { outlookService } from "@/services/outlookService";

// Sample spam emails that would be detected from Outlook
const initialSpamEmails = [
  {
    id: "spam1",
    subject: "You have won a special prize! 🏆",
    sender: {
      name: "Prize Department",
      email: "noreply@prizes-winner.example.com",
    },
    preview: "Congratulations! You have been selected to receive our grand prize of...",
    date: "2025-04-09T10:15:00",
  },
  {
    id: "spam2",
    subject: "Urgent: Your account requires verification 🔐",
    sender: {
      name: "Security Team",
      email: "security@banking-verify.example.com",
    },
    preview: "We have detected unusual activity in your account. Please verify...",
    date: "2025-04-08T14:23:00",
  },
  {
    id: "spam3",
    subject: "Limited time offer: 90% discount TODAY ONLY! 💰",
    sender: {
      name: "Amazing Deals",
      email: "deals@shopping-discounts.example.com",
    },
    preview: "Don't miss this incredible opportunity to save on all products with...",
    date: "2025-04-07T09:45:00",
  },
];

export default function Spam() {
  const [emails, setEmails] = useState(initialSpamEmails);
  const [loading, setLoading] = useState(false);
  const [isOutlookConnected, setIsOutlookConnected] = useState(false);
  const { toast } = useToast();

  // Check if Outlook is connected on component mount
  useEffect(() => {
    const connected = outlookService.checkConnection();
    setIsOutlookConnected(connected);
    
    if (connected) {
      fetchSpamFromOutlook();
    }
  }, []);

  const fetchSpamFromOutlook = async () => {
    setLoading(true);
    try {
      // In a real implementation, this would fetch spam emails from Outlook
      // For now, we'll just use our initial spam emails and add some dynamic ones
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
      
      // Combine our initial spam with some dynamically generated ones
      const dynamicSpam = [
        {
          id: `spam${Date.now()}1`,
          subject: "URGENT: Update your payment information NOW! 💳",
          sender: {
            name: "Payment Services",
            email: "payments@secure-update-required.example.com",
          },
          preview: "Your account has been flagged for immediate attention. Please update your...",
          date: new Date().toISOString(),
        },
        {
          id: `spam${Date.now()}2`,
          subject: "Your inheritance is waiting for you 💼",
          sender: {
            name: "International Legal Office",
            email: "legal@inheritance-claim.example.com",
          },
          preview: "We have been trying to reach you about an unclaimed inheritance of $4.5 million...",
          date: new Date(Date.now() - 86400000).toISOString(), // Yesterday
        },
      ];
      
      // Only add dynamic spam if connected to Outlook
      if (isOutlookConnected) {
        setEmails([...initialSpamEmails, ...dynamicSpam]);
        toast({
          title: "Spam folder updated ✅",
          description: "Retrieved spam emails from your Outlook account.",
        });
      } else {
        setEmails(initialSpamEmails);
      }
    } catch (error) {
      console.error("Error fetching spam emails:", error);
      toast({
        title: "Error retrieving spam emails ❌",
        description: "Could not retrieve spam emails from Outlook.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleDelete = (id: string) => {
    setEmails(emails.filter(email => email.id !== id));
    toast({
      title: "Email deleted ✅",
      description: "The spam email has been permanently removed.",
    });
  };

  const handleNotSpam = (id: string) => {
    setEmails(emails.filter(email => email.id !== id));
    toast({
      title: "Marked as not spam ✅",
      description: "The email has been moved to your inbox.",
    });
  };

  const handleRefresh = () => {
    fetchSpamFromOutlook();
  };

  return (
    <div className="flex h-screen overflow-hidden bg-email-background">
      <EmailSidebar />
      
      <div className="flex-1 overflow-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <Shield className="h-6 w-6 mr-2 text-yellow-500" />
              <h1 className="text-2xl font-bold">Spam Folder ⚠️</h1>
            </div>
            
            <Button 
              variant="outline" 
              onClick={handleRefresh}
              disabled={loading}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh Spam 🔄
            </Button>
          </div>
          
          <div className="mb-6 bg-yellow-50 p-4 rounded-md border border-yellow-200">
            <p className="text-yellow-800">
              {isOutlookConnected ? (
                <>
                  <span className="font-medium">✅ Connected to Outlook</span>: Spam emails from your Outlook account are shown here. They will be automatically deleted after 30 days. 📩
                </>
              ) : (
                <>
                  <span className="font-medium">❌ Not connected to Outlook</span>: Connect your account in Settings to see your actual spam emails. These are sample emails only. 📨
                </>
              )}
            </p>
          </div>
          
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 px-4 bg-gray-50 rounded-lg">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-400 mb-4"></div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">Loading spam emails... ⏳</h3>
              <p className="text-sm text-gray-500 text-center max-w-md">
                Retrieving spam emails from your account.
              </p>
            </div>
          ) : emails.length > 0 ? (
            <div className="space-y-4">
              {emails.map((email) => (
                <Card key={email.id} className="hover:shadow-sm transition-shadow">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between">
                      <div className="flex items-center">
                        <Badge variant="outline" className="mr-2 bg-yellow-50 text-yellow-700 border-yellow-200">
                          Spam 🚫
                        </Badge>
                        <CardTitle className="text-base">{email.subject}</CardTitle>
                      </div>
                      <span className="text-xs text-email-text-muted">{formatDate(email.date)}</span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-3">
                      <div className="flex items-center">
                        <Avatar className="h-8 w-8 mr-2">
                          <AvatarFallback className="bg-red-100 text-red-600">
                            {email.sender.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">{email.sender.name}</p>
                          <p className="text-xs text-email-text-muted">{email.sender.email}</p>
                        </div>
                      </div>
                    </div>
                    <CardDescription className="text-sm mt-2">{email.preview}</CardDescription>
                    <div className="flex justify-end space-x-2 mt-4">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleNotSpam(email.id)}
                      >
                        <Mail className="h-4 w-4 mr-2" />
                        Not Spam 📩
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm" 
                        onClick={() => handleDelete(email.id)}
                      >
                        <TrashIcon className="h-4 w-4 mr-2" />
                        Delete Forever 🗑️
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 px-4 bg-gray-50 rounded-lg">
              <Shield className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-1">No spam messages 🎉</h3>
              <p className="text-sm text-gray-500 text-center max-w-md">
                Your spam folder is empty. Great job keeping your inbox clean! ✨
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
