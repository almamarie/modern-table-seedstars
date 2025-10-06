"use client";

import * as React from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { Check, Minus } from "lucide-react";

import { cn } from "../../lib/utils";

const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(({ className, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    className={cn(
      "peer data-[state=checked]:bg-primary data-[state=indeterminate]:bg-primary disabled:opacity-50 shadow border border-primary data-[state=indeterminate]:border-primary rounded-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring w-[16px] h-[16px] data-[state=checked]:text-primary-foreground data-[state=inderminate]:text-primary-foreground disabled:cursor-not-allowed shrink-0",
      className
    )}
    {...props}
  >
    <CheckboxPrimitive.Indicator
      className={cn("flex justify-center items-center text-current")}
    >
      {props.checked === "indeterminate" ? (
        <Minus className="w-[16px] h-[16px] text-primary-foreground" />
      ) : (
        <Check className="w-[16px] h-[16px]" />
      )}
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
));
Checkbox.displayName = CheckboxPrimitive.Root.displayName;

export { Checkbox };
