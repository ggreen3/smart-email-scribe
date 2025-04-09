
import { useState } from "react";
import { Coins, FileText, Banknote, Download, Search, ArrowUpDown, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";

type FinancialEmail = {
  id: string;
  subject: string;
  sender: {
    name: string;
    email: string;
  };
  date: string;
  preview: string;
  type: 'invoice' | 'receipt' | 'statement' | 'quote';
  amount?: string;
  status?: 'paid' | 'pending' | 'overdue';
  dueDate?: string;
  attachments: number;
};

const mockFinancialEmails: FinancialEmail[] = [
  {
    id: '1',
    subject: 'Invoice #1234 for Project Alpha',
    sender: {
      name: 'Acme Corp',
      email: 'invoicing@acmecorp.com'
    },
    date: '2025-04-07',
    preview: 'Please find attached invoice #1234 for Project Alpha consulting services for March 2025. Payment is due within 30 days.',
    type: 'invoice',
    amount: '$3,500.00',
    status: 'pending',
    dueDate: '2025-05-07',
    attachments: 1
  },
  {
    id: '2',
    subject: 'Payment Receipt - Invoice #987',
    sender: {
      name: 'Globex Corporation',
      email: 'accounts@globex.com'
    },
    date: '2025-04-05',
    preview: 'Thank you for your payment of $2,300.00 for invoice #987. This email serves as your receipt.',
    type: 'receipt',
    amount: '$2,300.00',
    status: 'paid',
    attachments: 1
  },
  {
    id: '3',
    subject: 'Quarterly Statement - Q1 2025',
    sender: {
      name: 'Initech Financial',
      email: 'statements@initech.com'
    },
    date: '2025-04-02',
    preview: 'Your Q1 2025 financial statement is now available. Please review the attached document for details.',
    type: 'statement',
    attachments: 2
  },
  {
    id: '4',
    subject: 'OVERDUE: Invoice #567 - Web Development',
    sender: {
      name: 'TechSolutions Inc',
      email: 'billing@techsolutions.com'
    },
    date: '2025-03-25',
    preview: 'This is a reminder that invoice #567 for $1,750.00 is now overdue. Please arrange payment as soon as possible.',
    type: 'invoice',
    amount: '$1,750.00',
    status: 'overdue',
    dueDate: '2025-03-15',
    attachments: 1
  },
  {
    id: '5',
    subject: 'Project Proposal Quote - Marketing Campaign',
    sender: {
      name: 'MediaMax Group',
      email: 'sales@mediamax.com'
    },
    date: '2025-03-20',
    preview: 'Based on our discussion, please find attached our quote for the upcoming marketing campaign. This quote is valid for 30 days.',
    type: 'quote',
    amount: '$12,500.00',
    dueDate: '2025-04-20',
    attachments: 2
  },
  {
    id: '6',
    subject: 'Receipt for Subscription Renewal',
    sender: {
      name: 'Cloud Services Ltd',
      email: 'billing@cloudservices.com'
    },
    date: '2025-03-15',
    preview: 'Thank you for renewing your annual subscription. Please find attached the receipt for your payment of $599.00.',
    type: 'receipt',
    amount: '$599.00',
    status: 'paid',
    attachments: 1
  }
];

export default function FinancialEmails() {
  const [emails, setEmails] = useState<FinancialEmail[]>(mockFinancialEmails);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  
  const filterEmails = () => {
    return emails.filter(email => {
      // Search query filter
      const matchesSearch = 
        email.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        email.sender.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        email.preview.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Type filter
      const matchesType = selectedTypes.length === 0 || selectedTypes.includes(email.type);
      
      // Status filter
      const matchesStatus = selectedStatuses.length === 0 || 
        (email.status && selectedStatuses.includes(email.status));
      
      return matchesSearch && matchesType && matchesStatus;
    });
  };
  
  const filteredEmails = filterEmails();
  
  // Group emails by type for the tabs
  const invoices = filteredEmails.filter(email => email.type === 'invoice');
  const receipts = filteredEmails.filter(email => email.type === 'receipt');
  const statements = filteredEmails.filter(email => email.type === 'statement');
  const quotes = filteredEmails.filter(email => email.type === 'quote');
  
  const getTypeIcon = (type: string) => {
    switch(type) {
      case 'invoice':
        return <FileText className="h-4 w-4 mr-2" />;
      case 'receipt':
        return <Banknote className="h-4 w-4 mr-2" />;
      case 'statement':
        return <FileText className="h-4 w-4 mr-2" />;
      case 'quote':
        return <FileText className="h-4 w-4 mr-2" />;
      default:
        return <FileText className="h-4 w-4 mr-2" />;
    }
  };
  
  const getStatusBadge = (status?: string) => {
    if (!status) return null;
    
    switch(status) {
      case 'paid':
        return <Badge className="bg-green-500">Paid</Badge>;
      case 'pending':
        return <Badge className="bg-amber-500">Pending</Badge>;
      case 'overdue':
        return <Badge variant="destructive">Overdue</Badge>;
      default:
        return null;
    }
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric'
    });
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold flex items-center">
          <Coins className="mr-2 h-6 w-6" />
          Financial Emails
        </h1>
        <div className="flex items-center space-x-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="flex items-center">
                <ArrowUpDown className="h-4 w-4 mr-2" />
                Filter
                <ChevronDown className="h-4 w-4 ml-2" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-56">
              <Command>
                <CommandInput placeholder="Search filters..." />
                <CommandList>
                  <CommandEmpty>No filters found.</CommandEmpty>
                  <CommandGroup heading="Type">
                    <CommandItem>
                      <div className="flex items-center space-x-2 w-full">
                        <Checkbox 
                          id="filter-invoice" 
                          checked={selectedTypes.includes('invoice')}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedTypes([...selectedTypes, 'invoice']);
                            } else {
                              setSelectedTypes(selectedTypes.filter(t => t !== 'invoice'));
                            }
                          }}
                        />
                        <label htmlFor="filter-invoice" className="flex-1 cursor-pointer">Invoices</label>
                      </div>
                    </CommandItem>
                    <CommandItem>
                      <div className="flex items-center space-x-2 w-full">
                        <Checkbox 
                          id="filter-receipt" 
                          checked={selectedTypes.includes('receipt')}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedTypes([...selectedTypes, 'receipt']);
                            } else {
                              setSelectedTypes(selectedTypes.filter(t => t !== 'receipt'));
                            }
                          }}
                        />
                        <label htmlFor="filter-receipt" className="flex-1 cursor-pointer">Receipts</label>
                      </div>
                    </CommandItem>
                    <CommandItem>
                      <div className="flex items-center space-x-2 w-full">
                        <Checkbox 
                          id="filter-statement" 
                          checked={selectedTypes.includes('statement')}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedTypes([...selectedTypes, 'statement']);
                            } else {
                              setSelectedTypes(selectedTypes.filter(t => t !== 'statement'));
                            }
                          }}
                        />
                        <label htmlFor="filter-statement" className="flex-1 cursor-pointer">Statements</label>
                      </div>
                    </CommandItem>
                    <CommandItem>
                      <div className="flex items-center space-x-2 w-full">
                        <Checkbox 
                          id="filter-quote" 
                          checked={selectedTypes.includes('quote')}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedTypes([...selectedTypes, 'quote']);
                            } else {
                              setSelectedTypes(selectedTypes.filter(t => t !== 'quote'));
                            }
                          }}
                        />
                        <label htmlFor="filter-quote" className="flex-1 cursor-pointer">Quotes</label>
                      </div>
                    </CommandItem>
                  </CommandGroup>
                  <Separator className="my-2" />
                  <CommandGroup heading="Status">
                    <CommandItem>
                      <div className="flex items-center space-x-2 w-full">
                        <Checkbox 
                          id="filter-paid" 
                          checked={selectedStatuses.includes('paid')}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedStatuses([...selectedStatuses, 'paid']);
                            } else {
                              setSelectedStatuses(selectedStatuses.filter(s => s !== 'paid'));
                            }
                          }}
                        />
                        <label htmlFor="filter-paid" className="flex-1 cursor-pointer">Paid</label>
                      </div>
                    </CommandItem>
                    <CommandItem>
                      <div className="flex items-center space-x-2 w-full">
                        <Checkbox 
                          id="filter-pending" 
                          checked={selectedStatuses.includes('pending')}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedStatuses([...selectedStatuses, 'pending']);
                            } else {
                              setSelectedStatuses(selectedStatuses.filter(s => s !== 'pending'));
                            }
                          }}
                        />
                        <label htmlFor="filter-pending" className="flex-1 cursor-pointer">Pending</label>
                      </div>
                    </CommandItem>
                    <CommandItem>
                      <div className="flex items-center space-x-2 w-full">
                        <Checkbox 
                          id="filter-overdue" 
                          checked={selectedStatuses.includes('overdue')}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedStatuses([...selectedStatuses, 'overdue']);
                            } else {
                              setSelectedStatuses(selectedStatuses.filter(s => s !== 'overdue'));
                            }
                          }}
                        />
                        <label htmlFor="filter-overdue" className="flex-1 cursor-pointer">Overdue</label>
                      </div>
                    </CommandItem>
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-email-text-muted" />
            <Input 
              type="text"
              placeholder="Search financial emails"
              className="pl-8 w-64"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      <Tabs defaultValue="all">
        <TabsList className="grid w-full grid-cols-5 mb-6">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
          <TabsTrigger value="receipts">Receipts</TabsTrigger>
          <TabsTrigger value="statements">Statements</TabsTrigger>
          <TabsTrigger value="quotes">Quotes</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all">
          <RenderEmailList emails={filteredEmails} formatDate={formatDate} getTypeIcon={getTypeIcon} getStatusBadge={getStatusBadge} />
        </TabsContent>
        
        <TabsContent value="invoices">
          <RenderEmailList emails={invoices} formatDate={formatDate} getTypeIcon={getTypeIcon} getStatusBadge={getStatusBadge} />
        </TabsContent>
        
        <TabsContent value="receipts">
          <RenderEmailList emails={receipts} formatDate={formatDate} getTypeIcon={getTypeIcon} getStatusBadge={getStatusBadge} />
        </TabsContent>
        
        <TabsContent value="statements">
          <RenderEmailList emails={statements} formatDate={formatDate} getTypeIcon={getTypeIcon} getStatusBadge={getStatusBadge} />
        </TabsContent>
        
        <TabsContent value="quotes">
          <RenderEmailList emails={quotes} formatDate={formatDate} getTypeIcon={getTypeIcon} getStatusBadge={getStatusBadge} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

interface RenderEmailListProps {
  emails: FinancialEmail[];
  formatDate: (date: string) => string;
  getTypeIcon: (type: string) => JSX.Element;
  getStatusBadge: (status?: string) => JSX.Element | null;
}

function RenderEmailList({ emails, formatDate, getTypeIcon, getStatusBadge }: RenderEmailListProps) {
  if (emails.length === 0) {
    return (
      <div className="flex items-center justify-center h-40 bg-gray-50 rounded-lg">
        <p className="text-email-text-muted">No financial emails found</p>
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-1 gap-4">
      {emails.map(email => (
        <Card key={email.id} className="hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex justify-between">
              <div>
                <CardTitle className="flex items-center">
                  {getTypeIcon(email.type)}
                  {email.subject}
                </CardTitle>
                <CardDescription>From: {email.sender.name} ({email.sender.email})</CardDescription>
              </div>
              <div className="flex items-center space-x-2">
                {getStatusBadge(email.status)}
                <Badge variant="outline" className="flex items-center">
                  <FileText className="h-3 w-3 mr-1" />
                  {email.attachments}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-email-text-secondary line-clamp-2">
              {email.preview}
            </p>
            
            <div className="mt-4 flex items-center justify-between">
              <div className="flex space-x-4">
                <div className="text-sm">
                  <span className="text-email-text-muted">Date: </span>
                  <span className="font-medium">{formatDate(email.date)}</span>
                </div>
                {email.amount && (
                  <div className="text-sm">
                    <span className="text-email-text-muted">Amount: </span>
                    <span className="font-medium">{email.amount}</span>
                  </div>
                )}
                {email.dueDate && (
                  <div className="text-sm">
                    <span className="text-email-text-muted">Due: </span>
                    <span className={cn(
                      "font-medium",
                      email.status === 'overdue' && "text-red-500"
                    )}>
                      {formatDate(email.dueDate)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end space-x-2">
            <Button variant="outline" size="sm">
              View
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}

// Helper function for class names
function cn(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}
