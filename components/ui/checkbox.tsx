import * as React from "react"

import { cn } from "@/lib/utils"

function Checkbox({ className, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type="checkbox"
      data-slot="checkbox"
      className={cn(
        "h-4 w-4 rounded border-input bg-transparent text-primary focus-visible:ring-ring/60 focus-visible:ring-2 disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
}

export { Checkbox }
