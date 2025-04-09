
import { useState } from "react";
import EmailSidebar from "@/components/EmailSidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Clock, Download, ArrowRight, AlarmClock, Inbox, RefreshCcw } from "lucide-react";

export default function EmailSummaries() {
  const [refreshing, setRefreshing] = useState(false);
  
  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-email-background">
      <EmailSidebar />
      
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Email Summaries</h1>
          
          <Button variant="outline" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCcw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
        </div>
        
        <Tabs defaultValue="1hour">
          <TabsList className="mb-6">
            <TabsTrigger value="1hour">Last Hour</TabsTrigger>
            <TabsTrigger value="4hours">Last 4 Hours</TabsTrigger>
            <TabsTrigger value="8hours">Last 8 Hours</TabsTrigger>
            <TabsTrigger value="24hours">Last 24 Hours</TabsTrigger>
            <TabsTrigger value="48hours">Last 48 Hours</TabsTrigger>
          </TabsList>
          
          <TabsContent value="1hour">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-xl">Summary for Last Hour</CardTitle>
                <p className="text-sm text-muted-foreground">April 9, 2025 - 3:00 PM to 4:00 PM</p>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-3">
                  <div className="flex items-center space-x-4">
                    <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                      <Inbox className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">3</p>
                      <p className="text-sm text-muted-foreground">New Emails</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center">
                      <AlarmClock className="h-6 w-6 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">1</p>
                      <p className="text-sm text-muted-foreground">Time-Sensitive</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                      <Download className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">2</p>
                      <p className="text-sm text-muted-foreground">Attachments</p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-8">
                  <h3 className="font-semibold mb-4">Key Messages</h3>
                  <div className="space-y-4">
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center">
                            <Avatar className="h-8 w-8 mr-2">
                              <AvatarFallback>AC</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">John Doe (Acme Corp)</p>
                              <p className="text-sm text-muted-foreground">Project Proposal Review</p>
                            </div>
                          </div>
                          <div className="flex items-center">
                            <Clock className="h-3 w-3 mr-1 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">15 min ago</span>
                          </div>
                        </div>
                        <p className="text-sm">Response needed: Team is waiting for your feedback on the project proposal before proceeding to the next phase.</p>
                        <div className="mt-2">
                          <Badge className="bg-amber-100 text-amber-800">Urgent</Badge>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center">
                            <Avatar className="h-8 w-8 mr-2">
                              <AvatarFallback>SI</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">Tony Stark (Stark Industries)</p>
                              <p className="text-sm text-muted-foreground">New Technology Demo Invitation</p>
                            </div>
                          </div>
                          <div className="flex items-center">
                            <Clock className="h-3 w-3 mr-1 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">30 min ago</span>
                          </div>
                        </div>
                        <p className="text-sm">Invitation to an exclusive demo of new clean energy technology next Thursday at 2 PM.</p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
                
                <div className="mt-6 text-center">
                  <Button variant="outline" className="text-sm">
                    View All Emails
                    <ArrowRight className="ml-1 h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="4hours">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Summary for Last 4 Hours</CardTitle>
                <p className="text-sm text-muted-foreground">April 9, 2025 - 12:00 PM to 4:00 PM</p>
              </CardHeader>
              <CardContent>
                <p className="text-lg">You received 7 new emails in the last 4 hours, including:</p>
                <ul className="list-disc list-inside mt-2 space-y-1 text-muted-foreground">
                  <li>3 client communications</li>
                  <li>2 team updates</li>
                  <li>1 calendar invitation</li>
                  <li>1 newsletter</li>
                </ul>
                
                <div className="mt-4">
                  <p className="text-sm">There are 2 emails that might require your attention:</p>
                  <ul className="list-disc list-inside mt-1 ml-4 space-y-1 text-sm">
                    <li>Project deadline update from Team Lead</li>
                    <li>Client meeting request for tomorrow</li>
                  </ul>
                </div>
                
                <div className="mt-6 text-center">
                  <Button>
                    View Detailed Summary
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="8hours">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Summary for Last 8 Hours</CardTitle>
                <p className="text-sm text-muted-foreground">April 9, 2025 - 8:00 AM to 4:00 PM</p>
              </CardHeader>
              <CardContent>
                <p>Activity summary for last 8 hours will appear here.</p>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="24hours">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Summary for Last 24 Hours</CardTitle>
                <p className="text-sm text-muted-foreground">April 8, 2025 - 4:00 PM to April 9, 2025 - 4:00 PM</p>
              </CardHeader>
              <CardContent>
                <p>Activity summary for last 24 hours will appear here.</p>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="48hours">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Summary for Last 48 Hours</CardTitle>
                <p className="text-sm text-muted-foreground">April 7, 2025 - 4:00 PM to April 9, 2025 - 4:00 PM</p>
              </CardHeader>
              <CardContent>
                <p>Activity summary for last 48 hours will appear here.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
