
import { useState } from "react";
import EmailSidebar from "@/components/EmailSidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, Clock, Mail, Plus, Trash } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

type ChaserType = "payment" | "response" | "custom";

interface Chaser {
  id: string;
  subject: string;
  recipient: string;
  type: ChaserType;
  message: string;
  sendDate: string;
  status: "scheduled" | "sent" | "canceled";
}

export default function ChaserEmails() {
  const [chasers, setChasers] = useState<Chaser[]>([
    {
      id: "1",
      subject: "Payment Reminder: Invoice #12345",
      recipient: "client@example.com",
      type: "payment",
      message: "This is a friendly reminder that payment for Invoice #12345 is due in 3 days. Please let me know if you have any questions.",
      sendDate: "2025-04-12T09:00:00",
      status: "scheduled"
    },
    {
      id: "2",
      subject: "Following up on our discussion",
      recipient: "partner@example.com",
      type: "response",
      message: "I'm following up on our meeting last week. Have you had a chance to review the proposal I sent?",
      sendDate: "2025-04-10T14:30:00",
      status: "scheduled"
    },
    {
      id: "3",
      subject: "Project Status Update Request",
      recipient: "team@example.com",
      type: "custom",
      message: "Could you please provide an update on the current status of the project? We have a client meeting next week.",
      sendDate: "2025-04-08T11:00:00",
      status: "sent"
    }
  ]);
  
  const [newChaser, setNewChaser] = useState<Partial<Chaser>>({
    type: "response"
  });
  
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  const handleAddChaser = () => {
    if (!newChaser.subject || !newChaser.recipient || !newChaser.message || !date) {
      toast({
        title: "Missing fields",
        description: "Please fill out all required fields.",
        variant: "destructive",
      });
      return;
    }
    
    const chaserToAdd: Chaser = {
      id: Date.now().toString(),
      subject: newChaser.subject || "",
      recipient: newChaser.recipient || "",
      type: newChaser.type as ChaserType || "custom",
      message: newChaser.message || "",
      sendDate: date.toISOString(),
      status: "scheduled"
    };
    
    setChasers(prev => [...prev, chaserToAdd]);
    
    // Reset form
    setNewChaser({
      type: "response"
    });
    setDate(undefined);
    setDialogOpen(false);
    
    toast({
      title: "Chaser created",
      description: "Your email chaser has been scheduled."
    });
  };

  const handleCancelChaser = (id: string) => {
    setChasers(prev => 
      prev.map(chaser => 
        chaser.id === id 
          ? { ...chaser, status: "canceled" } 
          : chaser
      )
    );
    
    toast({
      title: "Chaser canceled",
      description: "The scheduled email chaser has been canceled."
    });
  };

  const handleDeleteChaser = (id: string) => {
    setChasers(prev => prev.filter(chaser => chaser.id !== id));
    
    toast({
      title: "Chaser deleted",
      description: "The email chaser has been deleted."
    });
  };

  const handleNewChaserChange = (key: keyof Chaser, value: string) => {
    setNewChaser(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const getChaserTypeBadge = (type: ChaserType) => {
    switch (type) {
      case "payment":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Payment</Badge>;
      case "response":
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">Response</Badge>;
      case "custom":
        return <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-200">Custom</Badge>;
      default:
        return null;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, "PPP 'at' p");
  };

  return (
    <div className="flex h-screen overflow-hidden bg-email-background">
      <EmailSidebar />
      
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Email Chasers</h1>
          
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Chaser
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[525px]">
              <DialogHeader>
                <DialogTitle>Create New Email Chaser</DialogTitle>
                <DialogDescription>
                  Schedule a follow-up email to be sent automatically.
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <label htmlFor="chaserType" className="text-right">Type</label>
                  <Select 
                    value={newChaser.type as string || "response"} 
                    onValueChange={(value) => handleNewChaserChange("type", value as ChaserType)}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select chaser type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="payment">Payment Reminder</SelectItem>
                      <SelectItem value="response">Response Request</SelectItem>
                      <SelectItem value="custom">Custom Message</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <label htmlFor="recipient" className="text-right">Recipient</label>
                  <Input
                    id="recipient"
                    placeholder="recipient@example.com"
                    className="col-span-3"
                    value={newChaser.recipient || ""}
                    onChange={(e) => handleNewChaserChange("recipient", e.target.value)}
                  />
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <label htmlFor="subject" className="text-right">Subject</label>
                  <Input
                    id="subject"
                    placeholder="Email subject"
                    className="col-span-3"
                    value={newChaser.subject || ""}
                    onChange={(e) => handleNewChaserChange("subject", e.target.value)}
                  />
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <label htmlFor="sendDate" className="text-right">Send Date</label>
                  <div className="col-span-3">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !date && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {date ? format(date, "PPP") : <span>Pick a date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={date}
                          onSelect={setDate}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
                
                <div className="grid grid-cols-4 items-start gap-4">
                  <label htmlFor="message" className="text-right">Message</label>
                  <Textarea
                    id="message"
                    placeholder="Type your message here"
                    className="col-span-3"
                    rows={5}
                    value={newChaser.message || ""}
                    onChange={(e) => handleNewChaserChange("message", e.target.value)}
                  />
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleAddChaser}>Create Chaser</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {chasers.map((chaser) => (
            <Card key={chaser.id} className={cn(
              "transition-all",
              chaser.status === "canceled" && "opacity-60"
            )}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-base">{chaser.subject}</CardTitle>
                  {getChaserTypeBadge(chaser.type)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center text-sm">
                    <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>{chaser.recipient}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>{formatDate(chaser.sendDate)}</span>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground line-clamp-2 mt-2">
                      {chaser.message}
                    </p>
                  </div>
                  <Badge variant={
                    chaser.status === "sent" ? "default" :
                    chaser.status === "canceled" ? "secondary" : "outline"
                  }>
                    {chaser.status === "scheduled" ? "Scheduled" :
                     chaser.status === "sent" ? "Sent" : "Canceled"}
                  </Badge>
                </div>
              </CardContent>
              <CardFooter>
                <div className="flex justify-between w-full">
                  {chaser.status === "scheduled" && (
                    <Button variant="outline" size="sm" onClick={() => handleCancelChaser(chaser.id)}>
                      Cancel
                    </Button>
                  )}
                  {chaser.status === "canceled" && (
                    <Button variant="outline" size="sm" onClick={() => handleDeleteChaser(chaser.id)}>
                      <Trash className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  )}
                  {chaser.status === "sent" && (
                    <Button variant="outline" size="sm">
                      View Result
                    </Button>
                  )}
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
