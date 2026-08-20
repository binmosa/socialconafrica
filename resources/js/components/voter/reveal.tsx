import { useEffect, useRef, useState } from 'react';
import type { ElementType, PropsWithChildren } from 'react';
import { cn } from '@/lib/utils';

type RevealProps = PropsWithChildren<{
    /** Stagger delay in milliseconds. */
    delay?: number;
    className?: string;
    as?: ElementType;
}>;

/**
 * Scroll-triggered fade-up (the template's AOS "fade-up"). Content is
 * always in the DOM; only opacity/transform animate, so it degrades to
 * static markup without JavaScript or with reduced motion.
 */
export function Reveal({
    children,
    delay = 0,
    className,
    as: Tag = 'div',
}: RevealProps) {
    const ref = useRef<HTMLElement>(null);
    const [shown, setShown] = useState(false);

    useEffect(() => {
        const node = ref.current;

        if (!node || typeof IntersectionObserver === 'undefined') {
            setShown(true);

            return;
        }

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries.some((entry) => entry.isIntersecting)) {
                    setShown(true);
                    observer.disconnect();
                }
            },
            { rootMargin: '0px 0px -10% 0px', threshold: 0.08 },
        );
        observer.observe(node);

        return () => observer.disconnect();
    }, []);

    return (
        <Tag
            ref={ref}
            style={{ transitionDelay: `${delay}ms` }}
            className={cn(
                'transition-[opacity,transform] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none',
                shown ? 'translate-y-0 opacity-100' : 'translate-y-7 opacity-0',
                className,
            )}
        >
            {children}
        </Tag>
    );
}
