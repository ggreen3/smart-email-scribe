
import { useState, useEffect } from "react";
import { Users, Building, ChevronRight, Mail, Phone, Calendar, Clock, Download, ExternalLink, ArrowLeft, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { EmailPreview } from "@/types/email";
import { useParams, Link, useNavigate } from "react-router-dom";
import EmailSidebar from "@/components/EmailSidebar";

type Client = {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  avatar?: string;
  website: string;
  address: string;
  status: 'active' | 'inactive';
  lastContact: string;
  contactHistory: {
    date: string;
    type: 'email' | 'call' | 'meeting';
    subject: string;
    notes?: string;
  }[];
  emails: EmailPreview[];
};

const mockClients: Record<string, Client> = {
  'acme-corp': {
    id: 'acme-corp',
    name: 'John Doe',
    email: 'john.doe@acmecorp.com',
    phone: '+1 (555) 123-4567',
    company: 'Acme Corporation',
    avatar: undefined,
    website: 'www.acmecorp.com',
    address: '123 Main St, New York, NY 10001',
    status: 'active',
    lastContact: '2025-04-05T14:30:00',
    contactHistory: [
      {
        date: '2025-04-05T14:30:00',
        type: 'email',
        subject: 'Project Proposal Follow-up',
        notes: 'Discussed timeline adjustments and budget considerations.'
      },
      {
        date: '2025-03-28T11:00:00',
        type: 'meeting',
        subject: 'Initial Project Review',
        notes: 'Presented project scope and received positive feedback.'
      },
      {
        date: '2025-03-15T10:15:00',
        type: 'call',
        subject: 'Introduction Call',
        notes: 'Introduced our services and discussed potential collaboration opportunities.'
      }
    ],
    emails: [
      {
        id: 'ac1',
        subject: 'Project Proposal Review',
        sender: {
          name: 'John Doe',
          email: 'john.doe@acmecorp.com',
          avatar: undefined
        },
        preview: 'Thank you for sending over the project proposal. I have reviewed it with our team and we have a few questions.',
        time: '2:30 PM',
        date: '2025-04-05',
        read: true,
        isStarred: true,
        hasAttachments: false
      },
      {
        id: 'ac2',
        subject: 'Meeting Notes - March 28',
        sender: {
          name: 'John Doe',
          email: 'john.doe@acmecorp.com'
        },
        preview: 'Here are the notes from our meeting yesterday. Please let me know if I missed anything important.',
        time: '9:15 AM',
        date: '2025-03-29',
        read: true,
        isStarred: false,
        hasAttachments: true
      },
      {
        id: 'ac3',
        subject: 'RE: Service Agreement',
        sender: {
          name: 'John Doe',
          email: 'john.doe@acmecorp.com'
        },
        preview: 'Our legal team has reviewed the agreement and has a few suggested modifications in the attached document.',
        time: '3:45 PM',
        date: '2025-03-20',
        read: true,
        isStarred: false,
        hasAttachments: true
      }
    ]
  },
  'globex': {
    id: 'globex',
    name: 'Jane Smith',
    email: 'jane.smith@globex.com',
    phone: '+1 (555) 987-6543',
    company: 'Globex Corporation',
    avatar: undefined,
    website: 'www.globexcorp.com',
    address: '456 Tech Blvd, San Francisco, CA 94107',
    status: 'active',
    lastContact: '2025-04-07T10:15:00',
    contactHistory: [
      {
        date: '2025-04-07T10:15:00',
        type: 'email',
        subject: 'Q2 Marketing Strategy',
        notes: 'Shared updated marketing plan for Q2 campaign.'
      },
      {
        date: '2025-04-02T15:30:00',
        type: 'call',
        subject: 'Budget Review',
        notes: 'Discussed Q2 budget allocation and performance targets.'
      },
      {
        date: '2025-03-25T13:00:00',
        type: 'meeting',
        subject: 'Strategy Session',
        notes: 'Quarterly strategy meeting with marketing and sales team.'
      }
    ],
    emails: [
      {
        id: 'gl1',
        subject: 'Marketing Campaign Results',
        sender: {
          name: 'Jane Smith',
          email: 'jane.smith@globex.com'
        },
        preview: 'Here are the results from our Q1 marketing campaign. The ROI exceeded our expectations!',
        time: '10:15 AM',
        date: '2025-04-07',
        read: false,
        isStarred: true,
        hasAttachments: true
      },
      {
        id: 'gl2',
        subject: 'Website Redesign Feedback',
        sender: {
          name: 'Jane Smith',
          email: 'jane.smith@globex.com'
        },
        preview: 'After reviewing the website mockups with our team, we have compiled our feedback in the attached document.',
        time: '4:30 PM',
        date: '2025-04-03',
        read: true,
        isStarred: false,
        hasAttachments: true
      },
      {
        id: 'gl3',
        subject: 'Partnership Opportunity',
        sender: {
          name: 'Jane Smith',
          email: 'jane.smith@globex.com'
        },
        preview: 'I wanted to discuss a potential partnership opportunity between our companies. Are you available for a call this week?',
        time: '11:45 AM',
        date: '2025-03-28',
        read: true,
        isStarred: true,
        hasAttachments: false
      }
    ]
  },
  'initech': {
    id: 'initech',
    name: 'Michael Johnson',
    email: 'michael@initech.com',
    phone: '+1 (555) 555-1234',
    company: 'Initech',
    avatar: undefined,
    website: 'www.initech.com',
    address: '789 Corporate Way, Austin, TX 78701',
    status: 'inactive',
    lastContact: '2025-03-15T09:00:00',
    contactHistory: [
      {
        date: '2025-03-15T09:00:00',
        type: 'email',
        subject: 'Contract Renewal',
        notes: 'Sent renewal terms for annual service contract.'
      },
      {
        date: '2025-02-28T14:00:00',
        type: 'call',
        subject: 'Service Review',
        notes: 'Discussed current service performance and potential upgrades.'
      }
    ],
    emails: [
      {
        id: 'in1',
        subject: 'Contract Renewal 2025-2026',
        sender: {
          name: 'Michael Johnson',
          email: 'michael@initech.com'
        },
        preview: 'Our current contract is set to expire next month. I have attached the renewal terms for your review.',
        time: '9:00 AM',
        date: '2025-03-15',
        read: true,
        isStarred: false,
        hasAttachments: true
      },
      {
        id: 'in2',
        subject: 'Service Downtime Notification',
        sender: {
          name: 'Michael Johnson',
          email: 'michael@initech.com'
        },
        preview: 'We will be performing system maintenance this weekend. Please expect service interruptions between 2-4 AM EST on Sunday.',
        time: '3:20 PM',
        date: '2025-02-24',
        read: true,
        isStarred: false,
        hasAttachments: false
      }
    ]
  },
  'stark-industries': {
    id: 'stark-industries',
    name: 'Tony Stark',
    email: 'tony@stark.com',
    phone: '+1 (555) 789-4561',
    company: 'Stark Industries',
    avatar: undefined,
    website: 'www.stark-industries.com',
    address: '200 Park Avenue, New York, NY 10166',
    status: 'active',
    lastContact: '2025-04-06T16:45:00',
    contactHistory: [
      {
        date: '2025-04-06T16:45:00',
        type: 'email',
        subject: 'New Technology Demo',
        notes: 'Scheduled demo of new energy technology for next week.'
      },
      {
        date: '2025-04-01T11:30:00',
        type: 'meeting',
        subject: 'Innovation Workshop',
        notes: 'Collaborative workshop on sustainable technology initiatives.'
      },
      {
        date: '2025-03-22T13:15:00',
        type: 'call',
        subject: 'Project Status Update',
        notes: 'Monthly project status review and milestone planning.'
      }
    ],
    emails: [
      {
        id: 'st1',
        subject: 'New Technology Demo Invitation',
        sender: {
          name: 'Tony Stark',
          email: 'tony@stark.com'
        },
        preview: 'I would like to invite you to an exclusive demo of our new clean energy technology next Thursday at 2 PM.',
        time: '4:45 PM',
        date: '2025-04-06',
        read: false,
        isStarred: true,
        hasAttachments: false
      },
      {
        id: 'st2',
        subject: 'R&D Collaboration Proposal',
        sender: {
          name: 'Tony Stark',
          email: 'tony@stark.com'
        },
        preview: 'Based on our recent discussions, I have drafted a proposal for a joint R&D initiative between our companies.',
        time: '10:30 AM',
        date: '2025-04-02',
        read: true,
        isStarred: true,
        hasAttachments: true
      },
      {
        id: 'st3',
        subject: 'Patent Filing Information',
        sender: {
          name: 'Tony Stark',
          email: 'tony@stark.com'
        },
        preview: 'Here are the details for the joint patent application we discussed. Our legal team has prepared all the necessary documents.',
        time: '2:15 PM',
        date: '2025-03-25',
        read: true,
        isStarred: false,
        hasAttachments: true
      },
      {
        id: 'st4',
        subject: 'Quarterly Business Review',
        sender: {
          name: 'Tony Stark',
          email: 'tony@stark.com'
        },
        preview: 'Attached is the quarterly business review report. Our partnership continues to exceed expectations in all key metrics.',
        time: '9:00 AM',
        date: '2025-03-15',
        read: true,
        isStarred: false,
        hasAttachments: true
      }
    ]
  }
};

export default function ClientEmails() {
  const { clientId } = useParams<{ clientId: string }>();
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchClientData = async () => {
      setLoading(true);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      if (clientId && mockClients[clientId]) {
        setClient(mockClients[clientId]);
      } else {
        toast({
          title: "Client not found",
          description: "The requested client could not be found.",
          variant: "destructive",
        });
        navigate('/clients');
      }
      
      setLoading(false);
    };
    
    fetchClientData();
  }, [clientId, navigate, toast]);

  if (loading) {
    return (
      <div className="flex h-screen overflow-hidden bg-email-background">
        <EmailSidebar />
        <div className="container mx-auto p-6 flex justify-center items-center h-64">
          <p className="text-email-text-muted">Loading client data...</p>
        </div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="flex h-screen overflow-hidden bg-email-background">
        <EmailSidebar />
        <div className="container mx-auto p-6 max-w-4xl">
          <div className="mb-6">
            <Button variant="outline" asChild>
              <Link to="/clients">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Clients
              </Link>
            </Button>
          </div>
          <div className="flex justify-center items-center h-64 bg-gray-50 rounded-lg">
            <p className="text-email-text-muted">Client not found</p>
          </div>
        </div>
      </div>
    );
  }

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

  const getContactIcon = (type: string) => {
    switch(type) {
      case 'email':
        return <Mail className="h-4 w-4 mr-2" />;
      case 'call':
        return <Phone className="h-4 w-4 mr-2" />;
      case 'meeting':
        return <Calendar className="h-4 w-4 mr-2" />;
      default:
        return <Clock className="h-4 w-4 mr-2" />;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-email-background">
      <EmailSidebar />
      <div className="flex-1 overflow-y-auto">
        <div className="container mx-auto p-6 max-w-4xl">
          <div className="mb-6">
            <Button variant="outline" asChild>
              <Link to="/clients">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Clients
              </Link>
            </Button>
          </div>
          
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex">
                  <Avatar className="h-16 w-16 mr-4">
                    <AvatarImage src={client.avatar} alt={client.name} />
                    <AvatarFallback>{client.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-2xl">{client.name}</CardTitle>
                    <CardDescription className="text-base mt-1">{client.company}</CardDescription>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge variant={client.status === 'active' ? 'default' : 'secondary'}>
                        {client.status === 'active' ? 'Active' : 'Inactive'}
                      </Badge>
                      <span className="text-sm text-email-text-muted">
                        Last contact: {formatDate(client.lastContact)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="space-x-2">
                  <Button variant="outline" size="sm">
                    <Mail className="h-4 w-4 mr-2" />
                    Email
                  </Button>
                  <Button variant="outline" size="sm">
                    <Phone className="h-4 w-4 mr-2" />
                    Call
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium mb-2">Contact Information</h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-email-text-muted">Email: </span>
                      <span>{client.email}</span>
                    </div>
                    <div>
                      <span className="text-email-text-muted">Phone: </span>
                      <span>{client.phone}</span>
                    </div>
                    <div>
                      <span className="text-email-text-muted">Address: </span>
                      <span>{client.address}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium mb-2">Company Information</h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-email-text-muted">Company: </span>
                      <span>{client.company}</span>
                    </div>
                    <div>
                      <span className="text-email-text-muted">Website: </span>
                      <a href={`https://${client.website}`} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline flex items-center">
                        {client.website}
                        <ExternalLink className="h-3 w-3 ml-1" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Tabs defaultValue="emails">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="emails">Emails</TabsTrigger>
              <TabsTrigger value="history">Contact History</TabsTrigger>
            </TabsList>
            
            <TabsContent value="emails">
              <div className="space-y-4">
                {client.emails.length > 0 ? (
                  client.emails.map(email => (
                    <Card key={email.id} className="hover:shadow-md transition-shadow">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between">
                          <CardTitle className="text-base">{email.subject}</CardTitle>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs text-email-text-muted">{email.date}</span>
                            {email.isStarred && (
                              <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                            )}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-email-text-secondary">
                          {email.preview}
                        </p>
                      </CardContent>
                      <CardFooter className="flex justify-between">
                        <span className="text-xs text-email-text-muted">
                          {email.hasAttachments && "Has attachments"}
                        </span>
                        <div className="space-x-2">
                          {email.hasAttachments && (
                            <Button variant="outline" size="sm">
                              <Download className="h-4 w-4 mr-2" />
                              Attachments
                            </Button>
                          )}
                          <Button size="sm">View</Button>
                        </div>
                      </CardFooter>
                    </Card>
                  ))
                ) : (
                  <div className="flex items-center justify-center h-40 bg-gray-50 rounded-lg">
                    <p className="text-email-text-muted">No emails found for this client</p>
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="history">
              <div className="space-y-4">
                {client.contactHistory.length > 0 ? (
                  client.contactHistory.map((contact, index) => (
                    <Card key={index}>
                      <CardHeader className="pb-2">
                        <div className="flex justify-between">
                          <CardTitle className="text-base flex items-center">
                            {getContactIcon(contact.type)}
                            {contact.subject}
                          </CardTitle>
                          <Badge variant="outline">
                            {contact.type.charAt(0).toUpperCase() + contact.type.slice(1)}
                          </Badge>
                        </div>
                        <CardDescription>{formatDate(contact.date)}</CardDescription>
                      </CardHeader>
                      {contact.notes && (
                        <CardContent>
                          <p className="text-sm">{contact.notes}</p>
                        </CardContent>
                      )}
                    </Card>
                  ))
                ) : (
                  <div className="flex items-center justify-center h-40 bg-gray-50 rounded-lg">
                    <p className="text-email-text-muted">No contact history found</p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
