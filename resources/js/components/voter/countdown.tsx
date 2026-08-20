import { useEffect, useState } from 'react';
import { useT } from '@/lib/i18n';

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

export function Countdown({ until, label }: { until: string; label: string }) {
    const { t } = useT();
    const target = new Date(until);
    const [parts, setParts] = useState<Parts | null>(() => partsUntil(target));

    useEffect(() => {
        const id = setInterval(() => setParts(partsUntil(new Date(until))), 1000);
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

    return (
        <div>
            <p className="mb-2 text-xs font-semibold tracking-widest text-ember uppercase">
                {label}
            </p>
            <div className="flex gap-2.5" role="timer" aria-label={label}>
                {units.map((unit) => (
                    <div
                        key={unit.label}
                        className="shadow-lift min-w-16 rounded-xl border border-border/60 bg-card px-2 py-2.5 text-center"
                    >
                        <p className="font-display text-2xl font-bold tabular-nums">
                            {String(unit.value).padStart(2, '0')}
                        </p>
                        <p className="text-[10px] font-medium tracking-wider text-mist uppercase">
                            {unit.label}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
}
