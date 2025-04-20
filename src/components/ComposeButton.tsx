
import { Mail } from "lucide-react";
import { Link } from "react-router-dom";

export function ComposeButton() {
  return (
    <div className="fixed bottom-4 right-4 md:hidden">
      <Link
        to="/compose"
        className="bg-email-primary text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg"
      >
        <Mail className="h-6 w-6" />
      </Link>
    </div>
  );
}
