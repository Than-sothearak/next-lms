import { Loader2 } from "lucide-react";

export default function PageLoading() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex min-h-[60vh] w-full flex-col items-center justify-center gap-3 p-6"
    >
      <Loader2
        aria-hidden="true"
        className="h-10 w-10 animate-spin text-blue-600 motion-reduce:animate-none"
      />
      <p className="text-sm text-muted-foreground">Loading page...</p>
    </div>
  );
}
