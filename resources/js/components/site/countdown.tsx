import { CSSProperties, useEffect, useState } from 'react';

import { useT } from '@/lib/i18n';

interface Props {
    target: Date;
}

function computeRemaining(target: Date) {
    const now = Date.now();
    const diff = Math.max(0, target.getTime() - now);
    const days = Math.floor(diff / 86400000);
    const hours = Math.floor((diff / 3600000) % 24);
    const minutes = Math.floor((diff / 60000) % 60);
    const seconds = Math.floor((diff / 1000) % 60);
    return { days, hours, minutes, seconds };
}

/** Countdown as four conic-gradient progress dials in the logo colors. */
export function Countdown({ target }: Props) {
    const { t } = useT();
    const [time, setTime] = useState(() => computeRemaining(target));

    useEffect(() => {
        const id = window.setInterval(() => setTime(computeRemaining(target)), 1000);
        return () => window.clearInterval(id);
    }, [target]);

    const dials: Array<{ key: string; label: string; value: number; progress: number; from: string; to: string }> = [
        { key: 'days', label: t('hero.countdown.days'), value: time.days, progress: Math.min(time.days / 365, 1), from: '#4CAF50', to: '#C8F169' },
        { key: 'hours', label: t('hero.countdown.hours'), value: time.hours, progress: time.hours / 24, from: '#F0A500', to: '#FFE28A' },
        { key: 'minutes', label: t('hero.countdown.minutes'), value: time.minutes, progress: time.minutes / 60, from: '#E6301F', to: '#FF9D6F' },
        { key: 'seconds', label: t('hero.countdown.seconds'), value: time.seconds, progress: time.seconds / 60, from: '#1565D8', to: '#8FD0FF' },
    ];

    return (
        <div className="sca-dials">
            {dials.map((dial) => (
                <div
                    key={dial.key}
                    className={`sca-dial dial-${dial.key}`}
                    style={{ '--p': Math.max(dial.progress * 100, 2), '--dial-from': dial.from, '--dial-to': dial.to } as CSSProperties}
                >
                    <span className="sca-dial-value">
                        {String(dial.value).padStart(2, '0')}
                        <small>{dial.label}</small>
                    </span>
                </div>
            ))}
        </div>
    );
}
