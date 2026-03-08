import { cva } from 'class-variance-authority'
import { cn } from './cn'

const badgeVariants = cva('inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium', {
  variants: {
    variant: {
      default: 'border-neutral-200 bg-neutral-100 text-neutral-900',
      verified: 'border-green-200 bg-green-100 text-green-700',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
})

export function Badge({ className, variant, children }) {
  return <span className={cn(badgeVariants({ variant }), className)}>{children}</span>
}
