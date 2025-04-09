
import { useState } from "react";
import { Clock, Send, Plus, Trash, Calendar, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

type Chaser = {
  id: string;
  subject: string;
  recipient: string;
  message: string;
  sendDate: string;
  status: 'scheduled' | 'sent' | 'canceled';
  type: 'payment' | 'response' | 'custom';
};

const mockChasers: Chaser[] = [
  {
    id: '1',
    subject: 'Follow-up: Invoice #1234',
    recipient: 'accounting@acmecorp.com',
    message: 'This is a friendly reminder that invoice #1234 for $1,500 is due this Friday. Please let me know if you have any questions.',
    sendDate: '2025-04-12T09:00:00',
    status: 'scheduled',
    type: 'payment'
  },
  {
    id: '2',
    subject: 'Pending Response: Project Proposal',
    recipient: 'john.smith@globex.com',
    message: 'I wanted to follow up on the project proposal I sent last week. Would you like to schedule a call to discuss the details?',
    sendDate: '2025-04-10T14:00:00',
    status: 'scheduled',
    type: 'response'
  },
  {
    id: '3',
    subject: 'Meeting Notes from Yesterday',
    recipient: 'team@initech.com',
    message: 'I sent the meeting notes yesterday and wanted to confirm if you had a chance to review them. Please let me know if you have any questions.',
    sendDate: '2025-04-08T11:00:00',
    status: 'sent',
    type: 'response'
  },
  {
    id: '4',
    subject: 'Past Due: Invoice #987',
    recipient: 'finance@starkindustries.com',
    message: 'We noticed that invoice #987 for $2,300 is now 7 days past due. Please arrange payment at your earliest convenience.',
    sendDate: '2025-04-05T10:00:00',
    status: 'sent',
    type: 'payment'
  }
];

export default function ChaserEmails() {
  const [chasers, setChasers] = useState<Chaser[]>(mockChasers);
  const [newChaser, setNewChaser] = useState<Partial<Chaser>>({
    subject: '',
    recipient: '',
    message: '',
    sendDate: '',
    type: 'custom'
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const handleCreateChaser = () => {
    if (!newChaser.subject || !newChaser.recipient || !newChaser.message || !newChaser.sendDate) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    const chaserToAdd: Chaser = {
      id: Date.now().toString(),
      subject: newChaser.subject,
      recipient: newChaser.recipient,
      message: newChaser.message,
      sendDate: new Date(newChaser.sendDate).toISOString(),
      status: 'scheduled',
      type: newChaser.type as 'payment' | 'response' | 'custom'
    };

    setChasers(prev => [chaserToAdd, ...prev]);
    setNewChaser({
      subject: '',
      recipient: '',
      message: '',
      sendDate: '',
      type: 'custom'
    });
    setIsDialogOpen(false);

    toast({
      title: "Chaser created",
      description: "Your reminder email has been scheduled.",
    });
  };

  const handleDeleteChaser = (id: string) => {
    setChasers(prev => prev.filter(chaser => chaser.id !== id));
    toast({
      title: "Chaser deleted",
      description: "The reminder email has been removed.",
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTemplateMessage = (type: string) => {
    switch(type) {
      case 'payment':
        return 'This is a friendly reminder that invoice #[NUMBER] for $[AMOUNT] is due on [DATE]. Please let me know if you have any questions.';
      case 'response':
        return 'I wanted to follow up on my previous email regarding [TOPIC]. Would you be available to discuss this further?';
      default:
        return '';
    }
  };

  const handleTemplateChange = (type: string) => {
    setNewChaser(prev => ({
      ...prev,
      type,
      message: getTemplateMessage(type)
    }));
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold flex items-center">
          <Clock className="mr-2 h-6 w-6" />
          Email Chasers & Reminders
        </h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Chaser
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[550px]">
            <DialogHeader>
              <DialogTitle>Create New Chaser Email</DialogTitle>
              <DialogDescription>
                Set up an automatic follow-up email to be sent at a specific time.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="chaser-template" className="text-right">
                  Template
                </Label>
                <Select 
                  value={newChaser.type} 
                  onValueChange={handleTemplateChange}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select a template" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="payment">Payment Reminder</SelectItem>
                    <SelectItem value="response">Response Needed</SelectItem>
                    <SelectItem value="custom">Custom Message</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="chaser-recipient" className="text-right">
                  Recipient
                </Label>
                <Input
                  id="chaser-recipient"
                  placeholder="recipient@example.com"
                  className="col-span-3"
                  value={newChaser.recipient}
                  onChange={(e) => setNewChaser(prev => ({ ...prev, recipient: e.target.value }))}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="chaser-subject" className="text-right">
                  Subject
                </Label>
                <Input
                  id="chaser-subject"
                  placeholder="Subject line"
                  className="col-span-3"
                  value={newChaser.subject}
                  onChange={(e) => setNewChaser(prev => ({ ...prev, subject: e.target.value }))}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="chaser-date" className="text-right">
                  Send Date
                </Label>
                <Input
                  id="chaser-date"
                  type="datetime-local"
                  className="col-span-3"
                  value={newChaser.sendDate}
                  onChange={(e) => setNewChaser(prev => ({ ...prev, sendDate: e.target.value }))}
                />
              </div>
              <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="chaser-message" className="text-right pt-2">
                  Message
                </Label>
                <Textarea
                  id="chaser-message"
                  placeholder="Enter your follow-up message"
                  className="col-span-3"
                  rows={6}
                  value={newChaser.message}
                  onChange={(e) => setNewChaser(prev => ({ ...prev, message: e.target.value }))}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <div></div>
                <div className="col-span-3 flex items-center space-x-2">
                  <Switch id="notification" />
                  <Label htmlFor="notification">Notify me when sent</Label>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" onClick={handleCreateChaser}>Create Chaser</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="scheduled">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
          <TabsTrigger value="sent">Sent</TabsTrigger>
          <TabsTrigger value="all">All</TabsTrigger>
        </TabsList>
        
        <TabsContent value="scheduled">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {chasers.filter(chaser => chaser.status === 'scheduled').map(chaser => (
              <Card key={chaser.id}>
                <CardHeader>
                  <div className="flex justify-between">
                    <div>
                      <CardTitle className="flex items-center">
                        {chaser.type === 'payment' ? 
                          <Bell className="h-4 w-4 mr-2 text-amber-500" /> : 
                          <Calendar className="h-4 w-4 mr-2 text-blue-500" />
                        }
                        {chaser.subject}
                      </CardTitle>
                      <CardDescription>To: {chaser.recipient}</CardDescription>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => handleDeleteChaser(chaser.id)}>
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-email-text-secondary line-clamp-3">
                    {chaser.message}
                  </p>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <p className="text-sm text-email-text-muted">
                    Scheduled for: {formatDate(chaser.sendDate)}
                  </p>
                  <Button variant="outline" size="sm">
                    <Send className="h-3 w-3 mr-2" />
                    Send Now
                  </Button>
                </CardFooter>
              </Card>
            ))}
            {chasers.filter(chaser => chaser.status === 'scheduled').length === 0 && (
              <div className="md:col-span-2 flex flex-col items-center justify-center h-40 bg-gray-50 rounded-lg">
                <p className="text-email-text-muted mb-4">No scheduled chasers</p>
                <Button onClick={() => setIsDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create New Chaser
                </Button>
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="sent">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {chasers.filter(chaser => chaser.status === 'sent').map(chaser => (
              <Card key={chaser.id}>
                <CardHeader>
                  <div className="flex justify-between">
                    <div>
                      <CardTitle>{chaser.subject}</CardTitle>
                      <CardDescription>To: {chaser.recipient}</CardDescription>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => handleDeleteChaser(chaser.id)}>
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-email-text-secondary line-clamp-3">
                    {chaser.message}
                  </p>
                </CardContent>
                <CardFooter>
                  <p className="text-sm text-email-text-muted">
                    Sent on: {formatDate(chaser.sendDate)}
                  </p>
                </CardFooter>
              </Card>
            ))}
            {chasers.filter(chaser => chaser.status === 'sent').length === 0 && (
              <div className="md:col-span-2 flex items-center justify-center h-40 bg-gray-50 rounded-lg">
                <p className="text-email-text-muted">No sent chasers</p>
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="all">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {chasers.map(chaser => (
              <Card key={chaser.id} className={chaser.status === 'sent' ? 'opacity-75' : ''}>
                <CardHeader>
                  <div className="flex justify-between">
                    <div>
                      <CardTitle className="flex items-center">
                        {chaser.status === 'scheduled' && 
                          (chaser.type === 'payment' ? 
                            <Bell className="h-4 w-4 mr-2 text-amber-500" /> : 
                            <Calendar className="h-4 w-4 mr-2 text-blue-500" />)
                        }
                        {chaser.subject}
                      </CardTitle>
                      <CardDescription>To: {chaser.recipient}</CardDescription>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => handleDeleteChaser(chaser.id)}>
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-email-text-secondary line-clamp-3">
                    {chaser.message}
                  </p>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <p className="text-sm text-email-text-muted">
                    {chaser.status === 'scheduled' ? 'Scheduled for: ' : 'Sent on: '}
                    {formatDate(chaser.sendDate)}
                  </p>
                  {chaser.status === 'scheduled' && (
                    <Button variant="outline" size="sm">
                      <Send className="h-3 w-3 mr-2" />
                      Send Now
                    </Button>
                  )}
                </CardFooter>
              </Card>
            ))}
            {chasers.length === 0 && (
              <div className="md:col-span-2 flex items-center justify-center h-40 bg-gray-50 rounded-lg">
                <p className="text-email-text-muted">No chasers found</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
