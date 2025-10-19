import { type ReactNode } from "react"
import { cn } from "@/lib/utils"

export type ModalProps = {
  open: boolean
  onClose: () => void
  title?: ReactNode
  description?: ReactNode
  children: ReactNode
  className?: string
}

export const Modal = ({ open, onClose, title, description, children, className }: ModalProps) => {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} aria-hidden="true" />
      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          "relative z-10 w-full max-w-xl overflow-hidden rounded-2xl border border-border bg-background shadow-2xl",
          className,
        )}
      >
        {(title || description) && (
          <div className="border-b border-border/60 px-6 py-5">
            {title && <h2 className="text-lg font-semibold">{title}</h2>}
            {description && <p className="text-sm text-muted-foreground">{description}</p>}
          </div>
        )}
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  )
}
