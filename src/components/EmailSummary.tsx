
import { useState, useEffect } from "react";
import { CalendarClock, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";

type TimeFrame = "1h" | "4h" | "8h" | "24h" | "48h";

interface SummaryData {
  timeframe: string;
  received: number;
  sent: number;
  important: number;
  unread: number;
  categories: {
    name: string;
    count: number;
  }[];
  topSenders: {
    name: string;
    email: string;
    count: number;
  }[];
}

const mockSummaryData: Record<TimeFrame, SummaryData> = {
  "1h": {
    timeframe: "Last Hour",
    received: 5,
    sent: 2,
    important: 3,
    unread: 4,
    categories: [
      { name: "Work", count: 3 },
      { name: "Personal", count: 2 }
    ],
    topSenders: [
      { name: "John Smith", email: "john@example.com", count: 2 },
      { name: "Jane Doe", email: "jane@example.com", count: 1 }
    ]
  },
  "4h": {
    timeframe: "Last 4 Hours",
    received: 12,
    sent: 5,
    important: 7,
    unread: 6,
    categories: [
      { name: "Work", count: 7 },
      { name: "Personal", count: 3 },
      { name: "Newsletters", count: 2 }
    ],
    topSenders: [
      { name: "John Smith", email: "john@example.com", count: 3 },
      { name: "Jane Doe", email: "jane@example.com", count: 2 },
      { name: "Acme Corp", email: "info@acme.com", count: 2 }
    ]
  },
  "8h": {
    timeframe: "Last 8 Hours",
    received: 23,
    sent: 9,
    important: 11,
    unread: 8,
    categories: [
      { name: "Work", count: 12 },
      { name: "Personal", count: 5 },
      { name: "Newsletters", count: 4 },
      { name: "Financials", count: 2 }
    ],
    topSenders: [
      { name: "John Smith", email: "john@example.com", count: 4 },
      { name: "Jane Doe", email: "jane@example.com", count: 3 },
      { name: "Acme Corp", email: "info@acme.com", count: 3 },
      { name: "Globex", email: "support@globex.com", count: 2 }
    ]
  },
  "24h": {
    timeframe: "Last 24 Hours",
    received: 42,
    sent: 17,
    important: 15,
    unread: 9,
    categories: [
      { name: "Work", count: 18 },
      { name: "Personal", count: 8 },
      { name: "Newsletters", count: 7 },
      { name: "Financials", count: 5 },
      { name: "Social", count: 4 }
    ],
    topSenders: [
      { name: "John Smith", email: "john@example.com", count: 5 },
      { name: "Jane Doe", email: "jane@example.com", count: 4 },
      { name: "Acme Corp", email: "info@acme.com", count: 4 },
      { name: "Globex", email: "support@globex.com", count: 3 },
      { name: "Initech", email: "hello@initech.com", count: 3 }
    ]
  },
  "48h": {
    timeframe: "Last 48 Hours",
    received: 78,
    sent: 32,
    important: 24,
    unread: 11,
    categories: [
      { name: "Work", count: 32 },
      { name: "Personal", count: 14 },
      { name: "Newsletters", count: 12 },
      { name: "Financials", count: 10 },
      { name: "Social", count: 10 }
    ],
    topSenders: [
      { name: "John Smith", email: "john@example.com", count: 8 },
      { name: "Jane Doe", email: "jane@example.com", count: 7 },
      { name: "Acme Corp", email: "info@acme.com", count: 6 },
      { name: "Globex", email: "support@globex.com", count: 5 },
      { name: "Initech", email: "hello@initech.com", count: 5 }
    ]
  }
};

export default function EmailSummary() {
  const [selectedTimeframe, setSelectedTimeframe] = useState<TimeFrame>("24h");
  const [summaryData, setSummaryData] = useState<SummaryData | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchSummaryData = () => {
    setLoading(true);
    
    // Simulate API call delay
    setTimeout(() => {
      setSummaryData(mockSummaryData[selectedTimeframe]);
      setLoading(false);
    }, 1000);
  };

  useEffect(() => {
    fetchSummaryData();
  }, [selectedTimeframe]);

  const handleRefresh = () => {
    fetchSummaryData();
    toast({
      title: "Refreshed",
      description: `Email summary for ${mockSummaryData[selectedTimeframe].timeframe} has been updated.`,
    });
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold flex items-center">
          <CalendarClock className="mr-2 h-6 w-6" />
          Email Summaries
        </h1>
        <Button variant="outline" onClick={handleRefresh} disabled={loading}>
          <RefreshCw className={cn("h-4 w-4 mr-2", loading && "animate-spin")} />
          Refresh
        </Button>
      </div>

      <Tabs defaultValue="24h" value={selectedTimeframe} onValueChange={(value) => setSelectedTimeframe(value as TimeFrame)}>
        <TabsList className="grid grid-cols-5 mb-6">
          <TabsTrigger value="1h">Last Hour</TabsTrigger>
          <TabsTrigger value="4h">Last 4 Hours</TabsTrigger>
          <TabsTrigger value="8h">Last 8 Hours</TabsTrigger>
          <TabsTrigger value="24h">Last 24 Hours</TabsTrigger>
          <TabsTrigger value="48h">Last 48 Hours</TabsTrigger>
        </TabsList>

        {Object.keys(mockSummaryData).map((timeframe) => (
          <TabsContent key={timeframe} value={timeframe} className="space-y-6">
            {summaryData ? (
              <>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-xl">Received</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-3xl font-bold">{summaryData.received}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-xl">Sent</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-3xl font-bold">{summaryData.sent}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-xl">Important</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-3xl font-bold">{summaryData.important}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-xl">Unread</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-3xl font-bold">{summaryData.unread}</p>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Top Categories</CardTitle>
                      <CardDescription>Email distribution by category</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {summaryData.categories.map((category, index) => (
                          <li key={index} className="flex justify-between items-center">
                            <span>{category.name}</span>
                            <span className="font-medium">{category.count}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle>Top Senders</CardTitle>
                      <CardDescription>Most frequent email senders</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-3">
                        {summaryData.topSenders.map((sender, index) => (
                          <li key={index}>
                            <div className="flex justify-between items-center">
                              <span className="font-medium">{sender.name}</span>
                              <span className="text-email-text-secondary">{sender.count}</span>
                            </div>
                            <p className="text-sm text-email-text-muted">{sender.email}</p>
                            {index < summaryData.topSenders.length - 1 && (
                              <Separator className="mt-2" />
                            )}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </>
            ) : (
              <div className="flex justify-center items-center h-64">
                <p className="text-email-text-muted">Loading summary data...</p>
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
