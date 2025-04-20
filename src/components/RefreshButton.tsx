
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

interface RefreshButtonProps {
  refreshing: boolean;
  onRefresh: () => void;
}

export function RefreshButton({ refreshing, onRefresh }: RefreshButtonProps) {
  return (
    <div className="fixed bottom-20 right-4 z-10">
      <Button
        size="sm"
        variant="outline"
        className="bg-white rounded-full w-12 h-12 shadow-lg"
        onClick={onRefresh}
        disabled={refreshing}
      >
        <RefreshCw className={`h-5 w-5 ${refreshing ? 'animate-spin' : ''}`} />
      </Button>
    </div>
  );
}
