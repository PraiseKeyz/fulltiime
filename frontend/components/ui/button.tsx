import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  // Base — layout, typography, focus ring, disabled state, and auto-sized icons.
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-bold transition-colors cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        // Default: plain neutral surface that fills with the brand green on hover.
        default:
          'bg-card text-foreground border-b hover:text-primary hover:border-primary',
        // Primary: solid green call-to-action.
        primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
        // Secondary: muted filled surface.
        secondary: 'bg-muted text-foreground hover:bg-card-hover',
        // Outline: bordered, transparent until hover.
        outline: 'border border-border bg-transparent text-foreground hover:bg-card-hover',
        // Ghost: no chrome until hover.
        ghost: 'bg-transparent text-foreground hover:bg-muted',
        // Destructive: red, for irreversible actions.
        destructive: 'bg-destructive text-white hover:bg-destructive/90',
        // Link: looks like inline text.
        link: 'bg-transparent text-primary underline-offset-4 hover:underline',
      },
      size: {
        sm: 'h-8 rounded-md px-3 text-xs',
        default: 'h-10 px-4 py-2',
        lg: 'h-12 rounded-xl px-6 text-[15px]',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

export interface ButtonProps
  extends React.ComponentProps<'button'>,
    VariantProps<typeof buttonVariants> {
  /** Render as the child element (e.g. an <a> or <Link>) instead of a <button>. */
  asChild?: boolean
}

function Button({ className, variant, size, asChild = false, ...props }: ButtonProps) {
  const Comp = asChild ? Slot : 'button'
  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
