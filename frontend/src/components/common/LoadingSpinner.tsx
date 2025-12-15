import { Loader } from "lucide-react";

export default function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center p-12">
      <Loader className="animate-spin text-blue-600" size={32} />
    </div>
  );
}
