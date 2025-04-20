
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmailLoadingStateProps {
  emailLoadingProgress: string | null;
  emailLoadingError: string | null;
  onRetry: () => void;
}

export function EmailLoadingState({ emailLoadingProgress, emailLoadingError, onRetry }: EmailLoadingStateProps) {
  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="text-center p-6 max-w-md">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500 mx-auto mb-4" />
        <h3 className="font-semibold text-lg mb-2">Loading your emails...</h3>
        {emailLoadingProgress && (
          <p className="text-sm text-gray-600 mb-2">{emailLoadingProgress}</p>
        )}
        {emailLoadingError && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{emailLoadingError}</p>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-2" 
              onClick={onRetry}
            >
              Try Again
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
