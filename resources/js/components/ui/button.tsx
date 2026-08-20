import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '@/lib/utils';

const buttonVariants = cva(
    "group inline-flex cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-lg font-bold transition-all outline-none disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 focus-visible:ring-[3px] focus-visible:ring-violet/40 aria-invalid:ring-destructive/20 aria-invalid:border-destructive",
    {
        variants: {
            variant: {
                default:
                    'bg-brand text-white shadow-glow hover:brightness-110 hover:shadow-[0_16px_36px_-12px_rgb(229_64_122/0.55)]',
                gold: 'bg-gold-fill text-ink hover:bg-[#ffc53d]',
                light: 'bg-white text-ink hover:bg-paper-soft',
                glass: 'border border-white/15 bg-white/10 text-white backdrop-blur hover:bg-white/20',
                outline:
                    'border border-ink/20 bg-transparent text-ink hover:border-ink hover:bg-ink hover:text-white',
                secondary: 'bg-paper-soft text-ink hover:bg-veil',
                ghost: 'text-ink hover:bg-ink/5',
                link: 'text-violet underline-offset-4 hover:underline',
                destructive: 'bg-destructive text-white hover:bg-destructive/90',
            },
            size: {
                default: 'h-11 px-5 text-sm has-[>svg]:pr-4',
                sm: 'h-9 rounded-md px-4 text-[13px] has-[>svg]:pr-3',
                lg: 'h-12 px-6 text-[15px] has-[>svg]:pr-5',
                xl: 'h-14 px-8 text-base has-[>svg]:pr-6',
                icon: 'size-11',
            },
        },
        defaultVariants: {
            variant: 'default',
            size: 'default',
        },
    },
);

function Button({
    className,
    variant,
    size,
    asChild = false,
    ...props
}: React.ComponentProps<'button'> &
    VariantProps<typeof buttonVariants> & {
        asChild?: boolean;
    }) {
    const Comp = asChild ? Slot : 'button';

    return (
        <Comp
            data-slot="button"
            className={cn(buttonVariants({ variant, size, className }))}
            {...props}
        />
    );
}

export { Button, buttonVariants };
