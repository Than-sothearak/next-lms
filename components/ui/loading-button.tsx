import { Loader2 } from "lucide-react";

import { Button, type ButtonProps } from "@/components/ui/button";

interface LoadingButtonProps extends Omit<ButtonProps, "asChild"> {
  loading: boolean;
  loadingText?: string;
}

export function LoadingButton({
  loading,
  loadingText = "Saving...",
  disabled,
  children,
  ...props
}: LoadingButtonProps) {
  return (
    <Button {...props} disabled={disabled || loading} aria-busy={loading}>
      {loading && <Loader2 className="mr-2 h-4 w-4 shrink-0 animate-spin" aria-hidden="true" />}
      <span role="status" aria-live="polite">{loading ? loadingText : children}</span>
    </Button>
  );
}
