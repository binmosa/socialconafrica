import type { ReactNode } from 'react';
import { PinwheelGlyph } from '@/components/voter/pinwheel-glyph';
import { Reveal } from '@/components/voter/reveal';
import { cn } from '@/lib/utils';

type SectionHeadingProps = {
    eyebrow: string;
    title: ReactNode;
    body?: ReactNode;
    tone?: 'light' | 'dark';
    align?: 'center' | 'start';
    className?: string;
    as?: 'h1' | 'h2';
};

/**
 * Template "heading6": glyph + uppercase eyebrow, large display title,
 * optional 70%-opacity lead paragraph.
 */
export function SectionHeading({
    eyebrow,
    title,
    body,
    tone = 'light',
    align = 'center',
    className,
    as: Title = 'h2',
}: SectionHeadingProps) {
    const dark = tone === 'dark';

    return (
        <Reveal
            className={cn(
                'max-w-2xl',
                align === 'center' ? 'mx-auto text-center' : 'text-left',
                className,
            )}
        >
            <p
                className={cn(
                    'inline-flex items-center gap-2 text-[13px] font-semibold tracking-[0.08em] uppercase',
                    dark ? 'text-white' : 'text-ink',
                )}
            >
                <PinwheelGlyph
                    className={cn(
                        'size-[18px]',
                        dark ? 'text-gold-fill' : 'text-violet',
                    )}
                />
                {eyebrow}
            </p>
            <Title
                className={cn(
                    'mt-4 font-display text-display-lg font-bold',
                    dark ? 'text-white' : 'text-ink',
                )}
            >
                {title}
            </Title>
            {body && (
                <p
                    className={cn(
                        'mt-4 text-[17px] leading-7 md:text-lg',
                        dark ? 'text-white/70' : 'text-ink/70',
                    )}
                >
                    {body}
                </p>
            )}
        </Reveal>
    );
}
