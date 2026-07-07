import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-semibold transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "bg-accent text-white hover:bg-accent-hover",
        secondary: "border border-line bg-surface text-label hover:bg-wash-hover",
        ghost: "text-muted hover:bg-wash-hover",
        danger: "border border-danger-border bg-surface text-danger hover:bg-danger-tint",
        "danger-solid": "bg-danger text-white hover:opacity-90",
      },
      size: {
        sm: "h-8 px-3 text-[13px]",
        default: "h-[38px] px-3.5 text-[14px]",
        lg: "h-11 px-4 text-[15px]",
        icon: "h-[38px] w-[38px]",
      },
    },
    defaultVariants: { variant: "primary", size: "default" },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, type = "button", ...props }, ref) => (
    <button ref={ref} type={type} className={cn(buttonVariants({ variant, size }), className)} {...props} />
  ),
);
Button.displayName = "Button";

export { Button, buttonVariants };
