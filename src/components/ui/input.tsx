import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        "h-8 w-full min-w-0 rounded-[8px] border border-[#64748b59] bg-transparent px-2.5 py-1 text-base font-medium text-slate-800 transition-all outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-slate-300 placeholder:font-normal placeholder:text-xs caret-brand-primary focus-visible:outline-none focus-visible:border-brand-primary focus-visible:ring-4 focus-visible:ring-brand-primary/20 focus-visible:bg-teal-50/20 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-slate-100/70 disabled:text-slate-400 disabled:select-none read-only:select-none read-only:cursor-not-allowed read-only:focus:ring-0 read-only:focus:border-[#64748b59] read-only:focus:bg-transparent aria-invalid:border-destructive aria-invalid:ring-1 aria-invalid:ring-destructive md:text-sm dark:bg-input/30 dark:disabled:bg-input/80 dark:text-slate-100",
        className
      )}
      {...props}
    />
  )
}

export { Input }
