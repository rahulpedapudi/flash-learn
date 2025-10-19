import * as React from "react"
import { cn } from "@/lib/utils"

export const Avatar = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "grid size-10 place-items-center rounded-full bg-primary/10 text-sm font-semibold text-primary",
      className,
    )}
    {...props}
  />
)
