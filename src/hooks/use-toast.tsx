import { toast as sonnerToast } from "sonner";

type ToastProps = {
  title?: string;
  description?: string;
  variant?: "default" | "destructive";
};

export function useToast() {
  return {
    toast: ({ title, description, variant = "default" }: ToastProps) => {
      const message = title ? `${title}${description ? ": " + description : ""}` : description;

      if (variant === "destructive") {
        sonnerToast.error(message);
      } else {
        sonnerToast.success(message);
      }
    },
  };
}
