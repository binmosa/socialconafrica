import { useEffect, useState } from 'react';
import { useT } from '@/lib/i18n';
import { cn } from '@/lib/utils';

type Parts = { days: number; hours: number; minutes: number; seconds: number };

function partsUntil(target: Date): Parts | null {
    const diff = target.getTime() - Date.now();

    if (diff <= 0) {
        return null;
    }

    return {
        days: Math.floor(diff / 86_400_000),
        hours: Math.floor(diff / 3_600_000) % 24,
        minutes: Math.floor(diff / 60_000) % 60,
        seconds: Math.floor(diff / 1_000) % 60,
    };
}

export function Countdown({
    until,
    label,
    tone = 'light',
    size = 'md',
    className,
}: {
    until: string;
    label: string;
    tone?: 'light' | 'dark';
    size?: 'md' | 'lg';
    className?: string;
}) {
    const { t } = useT();
    const target = new Date(until);
    const [parts, setParts] = useState<Parts | null>(() => partsUntil(target));

    useEffect(() => {
        const id = setInterval(
            () => setParts(partsUntil(new Date(until))),
            1000,
        );

        return () => clearInterval(id);
    }, [until]);

    if (!parts) {
        return null;
    }

    const units = [
        { value: parts.days, label: t('common.days') },
        { value: parts.hours, label: t('common.hours') },
        { value: parts.minutes, label: t('common.minutes') },
        { value: parts.seconds, label: t('common.seconds') },
    ];

    const dark = tone === 'dark';

    return (
        <div className={className}>
            <p
                className={cn(
                    'mb-3 text-xs font-semibold tracking-[0.16em] uppercase',
                    dark ? 'text-gold-fill' : 'text-ember',
                )}
            >
                {label}
            </p>
            <div className="flex gap-2.5" role="timer" aria-label={label}>
                {units.map((unit) => (
                    <div
                        key={unit.label}
                        className={cn(
                            'rounded-lg text-center',
                            size === 'lg'
                                ? 'min-w-[4.5rem] px-2 py-3'
                                : 'min-w-16 px-2 py-2.5',
                            dark
                                ? 'glass text-white'
                                : 'border border-border/60 bg-white shadow-lift',
                        )}
                    >
                        <p
                            className={cn(
                                'font-display font-bold tabular-nums',
                                size === 'lg'
                                    ? 'text-3xl md:text-4xl'
                                    : 'text-2xl',
                            )}
                        >
                            {String(unit.value).padStart(2, '0')}
                        </p>
                        <p
                            className={cn(
                                'text-[10px] font-semibold tracking-wider uppercase',
                                dark ? 'text-white/60' : 'text-mist',
                            )}
                        >
                            {unit.label}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
}
