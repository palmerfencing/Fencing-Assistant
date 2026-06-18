import * as React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => (
    <input
      type={type}
      className={cn(
        "h-11 w-full rounded-xl border border-stone-200 bg-white px-3 text-base text-forest-950 outline-none transition placeholder:text-stone-400 focus:border-forest-600 focus:ring-4 focus:ring-forest-100",
        className
      )}
      ref={ref}
      {...props}
    />
  )
);
Input.displayName = "Input";
