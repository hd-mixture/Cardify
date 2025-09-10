
"use client"

import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

const variantStyles = {
    success: { bar: "bg-success", title: "text-success", hover: "hover:bg-success" },
    warning: { bar: "bg-warning", title: "text-warning", hover: "hover:bg-warning" },
    error: { bar: "bg-error", title: "text-error", hover: "hover:bg-error" },
    destructive: { bar: "bg-destructive", title: "text-destructive", hover: "hover:bg-destructive" },
    info: { bar: "bg-info", title: "text-info", hover: "hover:bg-info" },
    default: { bar: "bg-primary", title: "text-primary", hover: "hover:bg-primary" },
};

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, variant, ...props }) {
        const v = variant || 'default';
        const styles = variantStyles[v as keyof typeof variantStyles] || variantStyles.default;

        return (
          <Toast key={id} {...props}>
            <div className={cn("absolute left-0 top-0 h-full w-1.5", styles.bar)} />
            <div className="ml-4 grid flex-1 gap-1">
              {title && <ToastTitle className={cn("font-semibold", styles.title)}>{title}</ToastTitle>}
              {description && (
                <ToastDescription>{description}</ToastDescription>
              )}
            </div>
            {action}
            <ToastClose className={cn(
                "absolute right-2 top-2 rounded-full p-1 text-foreground/50 transition-colors focus:opacity-100 focus:outline-none focus:ring-2 group-hover:opacity-100 hover:text-white",
                styles.hover
            )} />
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}

