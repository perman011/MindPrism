import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-semibold focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 transition-colors" +
  " hover-elevate active-elevate-2",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground rounded-full border border-primary-border",
        destructive:
          "bg-destructive text-destructive-foreground rounded-[12px] border border-destructive-border",
        outline:
          "rounded-[12px] border [border-color:var(--button-outline)] shadow-xs active:shadow-none",
        secondary: "rounded-[12px] border bg-secondary text-secondary-foreground border-secondary-border",
        ghost: "rounded-[12px] border border-transparent",
      },
      size: {
        default: "h-12 px-6 py-2",
        sm: "h-9 rounded-[12px] px-3 text-xs",
        lg: "h-12 rounded-full px-8",
        icon: "h-9 w-9 rounded-[12px]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  },
)
Button.displayName = "Button"

export { Button, buttonVariants }
