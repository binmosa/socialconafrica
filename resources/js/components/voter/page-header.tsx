import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type PageHeaderProps = {
    badge: string;
    title: ReactNode;
    subtitle?: ReactNode;
    children?: ReactNode;
    className?: string;
    live?: boolean;
};

/**
 * Light, high-contrast page opener: pill badge, large display title, lead
 * line and an optional tool row (search, filters, key facts).
 */
export function PageHeader({
    badge,
    title,
    subtitle,
    children,
    className,
    live,
}: PageHeaderProps) {
    return (
        <header
            className={cn(
                'mx-auto max-w-6xl px-4 pt-10 pb-6 md:pt-14 md:pb-8',
                className,
            )}
        >
            <span className="inline-flex items-center gap-2 rounded-full bg-veil px-3 py-1 text-[11px] font-bold tracking-[0.14em] text-violet uppercase">
                {live && (
                    <span
                        className="size-1.5 animate-pulse rounded-full bg-ember"
                        aria-hidden
                    />
                )}
                {badge}
            </span>
            <h1 className="mt-4 max-w-3xl font-display text-display-md font-bold text-ink md:text-display-lg">
                {title}
            </h1>
            {subtitle && (
                <p className="mt-3 max-w-2xl text-base leading-7 text-ink/65 md:text-lg">
                    {subtitle}
                </p>
            )}
            {children && <div className="mt-7">{children}</div>}
        </header>
    );
}
