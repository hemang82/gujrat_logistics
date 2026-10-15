import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex field-sizing-content min-h-16 w-full rounded-[8px] border border-[#64748b59] bg-transparent px-2.5 py-2 text-base font-semibold text-slate-900 transition-all outline-none placeholder:text-slate-400 placeholder:font-normal caret-brand-primary focus-visible:outline-none focus-visible:border-brand-primary focus-visible:ring-4 focus-visible:ring-brand-primary/20 focus-visible:bg-teal-50/20 disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-1 aria-invalid:ring-destructive md:text-sm dark:bg-input/30 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 dark:text-slate-100",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
