
import EmailSidebar from "@/components/EmailSidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { ArrowDownIcon, ArrowUpIcon, DollarSign, FileText, Filter, Search } from "lucide-react";

export default function Financials() {
  return (
    <div className="flex h-screen overflow-hidden bg-email-background">
      <EmailSidebar />
      
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Financial Emails</h1>
          
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search financial emails..."
                className="pl-8 w-64"
              />
            </div>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="grid gap-6 grid-cols-1 md:grid-cols-3 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Invoices Due</CardTitle>
              <CardDescription>Next 30 days</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-2xl font-bold">8</p>
                  <p className="text-sm text-muted-foreground">Total Invoices</p>
                </div>
                <div className="text-lg font-semibold text-green-600">$8,450.00</div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Recent Payments</CardTitle>
              <CardDescription>Last 30 days</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-2xl font-bold">5</p>
                  <p className="text-sm text-muted-foreground">Received</p>
                </div>
                <div className="text-lg font-semibold text-green-600">$6,205.75</div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Overdue Invoices</CardTitle>
              <CardDescription>Requires attention</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-2xl font-bold">3</p>
                  <p className="text-sm text-muted-foreground">Overdue</p>
                </div>
                <div className="text-lg font-semibold text-red-600">$3,290.00</div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Tabs defaultValue="emails">
          <TabsList className="mb-6">
            <TabsTrigger value="emails">Financial Emails</TabsTrigger>
            <TabsTrigger value="invoices">Invoices</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
          </TabsList>
          
          <TabsContent value="emails" className="space-y-4">
            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex justify-between">
                  <div className="flex items-center">
                    <Avatar className="h-8 w-8 mr-2">
                      <AvatarFallback>AC</AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-base">Invoice #12345 Payment Confirmation</CardTitle>
                      <CardDescription>Acme Corporation</CardDescription>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">Apr 8, 2025</p>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm">Thank you for your payment of $1,250.00 for Invoice #12345. Your payment has been processed and a receipt is attached.</p>
                <div className="flex items-center mt-2">
                  <Badge className="mr-2 bg-green-100 text-green-800">Payment</Badge>
                  <Badge variant="outline">Receipt</Badge>
                </div>
              </CardContent>
            </Card>
            
            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex justify-between">
                  <div className="flex items-center">
                    <Avatar className="h-8 w-8 mr-2">
                      <AvatarFallback>GX</AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-base">Quarterly Financial Report</CardTitle>
                      <CardDescription>Globex Corporation</CardDescription>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">Apr 5, 2025</p>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm">Attached is the quarterly financial report for Q1 2025. Please review the revenue projections and expense allocations.</p>
                <div className="flex items-center mt-2">
                  <Badge className="mr-2 bg-blue-100 text-blue-800">Report</Badge>
                  <Badge variant="outline">Attachment</Badge>
                </div>
              </CardContent>
            </Card>
            
            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex justify-between">
                  <div className="flex items-center">
                    <Avatar className="h-8 w-8 mr-2">
                      <AvatarFallback>SI</AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-base">Invoice #ST-789 - OVERDUE</CardTitle>
                      <CardDescription>Stark Industries</CardDescription>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">Apr 3, 2025</p>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm">This is a reminder that Invoice #ST-789 for $2,450.00 is now 15 days overdue. Please arrange payment as soon as possible.</p>
                <div className="flex items-center mt-2">
                  <Badge className="mr-2 bg-red-100 text-red-800">Overdue</Badge>
                  <Badge variant="outline">Invoice</Badge>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="invoices">
            <div className="rounded-md border">
              <div className="p-4 bg-muted/50 flex items-center gap-4">
                <div className="flex-1">Invoice</div>
                <div className="w-[100px]">Date</div>
                <div className="w-[100px]">Amount</div>
                <div className="w-[100px]">Status</div>
                <div className="w-[100px] text-right">Actions</div>
              </div>
              
              <div className="divide-y">
                <div className="p-4 flex items-center gap-4">
                  <div className="flex-1 flex items-center">
                    <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>Invoice #12345</span>
                  </div>
                  <div className="w-[100px] text-sm">Apr 1, 2025</div>
                  <div className="w-[100px] font-medium">$1,250.00</div>
                  <div className="w-[100px]">
                    <Badge className="bg-green-100 text-green-800">Paid</Badge>
                  </div>
                  <div className="w-[100px] text-right">
                    <Button variant="ghost" size="sm">View</Button>
                  </div>
                </div>
                
                <div className="p-4 flex items-center gap-4">
                  <div className="flex-1 flex items-center">
                    <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>Invoice #12346</span>
                  </div>
                  <div className="w-[100px] text-sm">Apr 15, 2025</div>
                  <div className="w-[100px] font-medium">$840.00</div>
                  <div className="w-[100px]">
                    <Badge variant="outline">Pending</Badge>
                  </div>
                  <div className="w-[100px] text-right">
                    <Button variant="ghost" size="sm">View</Button>
                  </div>
                </div>
                
                <div className="p-4 flex items-center gap-4">
                  <div className="flex-1 flex items-center">
                    <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>Invoice #ST-789</span>
                  </div>
                  <div className="w-[100px] text-sm">Mar 19, 2025</div>
                  <div className="w-[100px] font-medium">$2,450.00</div>
                  <div className="w-[100px]">
                    <Badge className="bg-red-100 text-red-800">Overdue</Badge>
                  </div>
                  <div className="w-[100px] text-right">
                    <Button variant="ghost" size="sm">View</Button>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="payments">
            <div className="rounded-md border">
              <div className="p-4 bg-muted/50 flex items-center gap-4">
                <div className="flex-1">Transaction</div>
                <div className="w-[120px]">Date</div>
                <div className="w-[100px]">Amount</div>
                <div className="w-[100px]">Type</div>
                <div className="w-[100px] text-right">Actions</div>
              </div>
              
              <div className="divide-y">
                <div className="p-4 flex items-center gap-4">
                  <div className="flex-1 flex items-center">
                    <DollarSign className="h-4 w-4 mr-2 text-green-600" />
                    <span>Payment from Acme Corp</span>
                  </div>
                  <div className="w-[120px] text-sm">Apr 8, 2025</div>
                  <div className="w-[100px] font-medium text-green-600 flex items-center">
                    <ArrowUpIcon className="h-3 w-3 mr-1" />
                    $1,250.00
                  </div>
                  <div className="w-[100px]">
                    <Badge variant="outline">Bank Transfer</Badge>
                  </div>
                  <div className="w-[100px] text-right">
                    <Button variant="ghost" size="sm">View</Button>
                  </div>
                </div>
                
                <div className="p-4 flex items-center gap-4">
                  <div className="flex-1 flex items-center">
                    <DollarSign className="h-4 w-4 mr-2 text-red-600" />
                    <span>Software Subscription</span>
                  </div>
                  <div className="w-[120px] text-sm">Apr 5, 2025</div>
                  <div className="w-[100px] font-medium text-red-600 flex items-center">
                    <ArrowDownIcon className="h-3 w-3 mr-1" />
                    $49.99
                  </div>
                  <div className="w-[100px]">
                    <Badge variant="outline">Credit Card</Badge>
                  </div>
                  <div className="w-[100px] text-right">
                    <Button variant="ghost" size="sm">View</Button>
                  </div>
                </div>
                
                <div className="p-4 flex items-center gap-4">
                  <div className="flex-1 flex items-center">
                    <DollarSign className="h-4 w-4 mr-2 text-green-600" />
                    <span>Payment from Globex</span>
                  </div>
                  <div className="w-[120px] text-sm">Apr 2, 2025</div>
                  <div className="w-[100px] font-medium text-green-600 flex items-center">
                    <ArrowUpIcon className="h-3 w-3 mr-1" />
                    $4,955.75
                  </div>
                  <div className="w-[100px]">
                    <Badge variant="outline">Wire Transfer</Badge>
                  </div>
                  <div className="w-[100px] text-right">
                    <Button variant="ghost" size="sm">View</Button>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
