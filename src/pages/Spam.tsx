
import { useState } from "react";
import { Shield, TrashIcon, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import EmailSidebar from "@/components/EmailSidebar";

const spamEmails = [
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
  const [emails, setEmails] = useState(spamEmails);
  const { toast } = useToast();

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

  return (
    <div className="flex h-screen overflow-hidden bg-email-background">
      <EmailSidebar />
      
      <div className="flex-1 overflow-auto">
        <div className="p-6">
          <div className="flex items-center mb-6">
            <Shield className="h-6 w-6 mr-2 text-yellow-500" />
            <h1 className="text-2xl font-bold">Spam Folder ⚠️</h1>
          </div>
          
          <p className="mb-6 text-email-text-secondary">
            Emails that have been identified as spam are shown here. They will be automatically deleted after 30 days.
          </p>
          
          {emails.length > 0 ? (
            <div className="space-y-4">
              {emails.map((email) => (
                <Card key={email.id} className="hover:shadow-sm transition-shadow">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between">
                      <div className="flex items-center">
                        <Badge variant="outline" className="mr-2 bg-yellow-50 text-yellow-700 border-yellow-200">
                          Spam
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
                        Not Spam
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm" 
                        onClick={() => handleDelete(email.id)}
                      >
                        <TrashIcon className="h-4 w-4 mr-2" />
                        Delete Forever
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
                Your spam folder is empty. Great job keeping your inbox clean!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
