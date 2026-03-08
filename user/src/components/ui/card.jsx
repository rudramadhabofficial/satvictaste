import { cn } from './cn'

export function Card({ className, children }) {
  return <div className={cn('rounded-lg border shadow-subtle bg-white', className)}>{children}</div>
}
export function CardContent({ className, children }) {
  return <div className={cn('p-6', className)}>{children}</div>
}
export function CardHeader({ className, children }) {
  return <div className={cn('p-6 pb-3', className)}>{children}</div>
}
export function CardTitle({ className, children }) {
  return <h3 className={cn('text-lg font-semibold', className)}>{children}</h3>
}
