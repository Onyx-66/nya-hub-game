// Type declarations for the JSX use-toast module.
declare module "@/components/ui/use-toast" {
  export interface Toast {
    id?: string;
    title?: string;
    description?: string;
    variant?: "default" | "destructive";
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    [key: string]: unknown;
  }

  export interface ToastReturn {
    id: string;
    dismiss: () => void;
    update: (props: Toast) => void;
  }

  export function toast(props: Toast): ToastReturn;

  export function useToast(): {
    toasts: Toast[];
    toast: typeof toast;
    dismiss: (toastId?: string) => void;
  };
}