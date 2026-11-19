import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex w-fit shrink-0 items-center justify-center gap-1 overflow-hidden whitespace-nowrap rounded-md border px-2 py-0.5 text-xs font-medium transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&>svg]:pointer-events-none [&>svg]:size-3',
  {
    variants: {
      variant: {
        default:
          'border-orange-600/40 bg-orange-500/15 text-orange-800 dark:border-orange-500/45 dark:bg-orange-500/15 dark:text-orange-400 [a&]:hover:bg-orange-500/25',
        secondary: 'border-transparent bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90',
        destructive:
          'border-red-600/40 bg-red-500/15 text-red-700 focus-visible:ring-destructive/20 dark:border-red-500/35 dark:bg-red-500/15 dark:text-red-400 dark:focus-visible:ring-destructive/40 [a&]:hover:bg-red-500/25',
        outline: 'text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground',
        honda:
          'border-red-600/40 bg-red-500/12 font-semibold text-red-700 dark:border-red-500/35 dark:bg-red-500/15 dark:text-red-400',
        yamaha:
          'border-blue-600/40 bg-blue-500/12 font-semibold text-blue-700 dark:border-blue-500/35 dark:bg-blue-500/15 dark:text-blue-400',
        suzuki:
          'border-amber-600/40 bg-amber-500/15 font-semibold text-amber-800 dark:border-yellow-400/35 dark:bg-yellow-400/15 dark:text-yellow-300',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<'span'> & VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : 'span';

  return <Comp data-slot="badge" className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
