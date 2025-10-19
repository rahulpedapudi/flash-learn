import * as React from "react"
import { cn } from "@/lib/utils"

export type TabsContextValue = {
  value: string
  setValue: (next: string) => void
}

const TabsContext = React.createContext<TabsContextValue | null>(null)

export type TabsProps = {
  defaultValue: string
  value?: string
  onValueChange?: (next: string) => void
  children: React.ReactNode
  className?: string
}

export const Tabs = ({ defaultValue, value, onValueChange, children, className }: TabsProps) => {
  const [internalValue, setInternalValue] = React.useState(defaultValue)
  const currentValue = value ?? internalValue

  const handleChange = (next: string) => {
    setInternalValue(next)
    onValueChange?.(next)
  }

  const contextValue = React.useMemo(
    () => ({ value: currentValue, setValue: handleChange }),
    [currentValue],
  )

  return (
    <TabsContext.Provider value={contextValue}>
      <div className={cn("flex flex-col gap-3", className)}>{children}</div>
    </TabsContext.Provider>
  )
}

export type TabsListProps = React.HTMLAttributes<HTMLDivElement>

export const TabsList = ({ className, ...props }: TabsListProps) => (
  <div
    className={cn(
      "inline-flex items-center rounded-lg border border-border bg-muted/40 p-1 text-muted-foreground",
      className,
    )}
    {...props}
  />
)

export type TabsTriggerProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  value: string
}

export const TabsTrigger = ({ value, className, ...props }: TabsTriggerProps) => {
  const context = React.useContext(TabsContext)
  if (!context) throw new Error("TabsTrigger must be used within <Tabs>")

  const isActive = context.value === value

  return (
    <button
      type="button"
      onClick={() => context.setValue(value)}
      className={cn(
        "relative inline-flex min-w-28 items-center justify-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition",
        isActive
          ? "bg-background text-foreground shadow-sm"
          : "text-muted-foreground hover:text-foreground",
        className,
      )}
      {...props}
    />
  )
}

export type TabsContentProps = React.HTMLAttributes<HTMLDivElement> & {
  value: string
}

export const TabsContent = ({ value, className, ...props }: TabsContentProps) => {
  const context = React.useContext(TabsContext)
  if (!context) throw new Error("TabsContent must be used within <Tabs>")

  if (context.value !== value) return null

  return (
    <div className={cn("rounded-xl border border-border/80 bg-background p-4", className)} {...props} />
  )
}
