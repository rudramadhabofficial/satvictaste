import { forwardRef } from 'react'
import { cn } from './cn'

export const Input = forwardRef(({ className, ...props }, ref) => {
  return (
    <input
      ref={ref}
      className={cn(
        'flex h-10 w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm shadow-subtle placeholder:text-neutral-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-200',
        className
      )}
      {...props}
    />
  )
})
