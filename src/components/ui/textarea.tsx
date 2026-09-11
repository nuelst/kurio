import { cn } from 'cn'
import type * as React from 'react'

function Textarea({ className, ...props }: React.ComponentProps<'textarea'>) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        'border-primary placeholder:text-[#B39463] focus-visible:border-ring focus-visible:ring-ring/50 disabled:bg-input/50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 min-h-20 w-full min-w-0 resize-y rounded-[5px] border bg-background px-4 py-3 text-base transition-colors outline-none focus-visible:ring-3 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:ring-3 md:text-sm',
        className,
      )}
      {...props}
    />
  )
}

export { Textarea }
