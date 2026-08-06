import { useEffect, useState } from 'react';

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

export function Countdown({ target }: Props) {
    const { t } = useT();
    const [time, setTime] = useState(() => computeRemaining(target));

    useEffect(() => {
        const id = window.setInterval(() => setTime(computeRemaining(target)), 1000);
        return () => window.clearInterval(id);
    }, [target]);

    const cells: Array<{ label: string; value: number }> = [
        { label: t('hero.countdown.days'), value: time.days },
        { label: t('hero.countdown.hours'), value: time.hours },
        { label: t('hero.countdown.minutes'), value: time.minutes },
    ];

    return (
        <div className="timer-area-start">
            <div className="timer">
                <div className="row">
                    {cells.map((cell) => (
                        <div key={cell.label} className="col-lg-12 col-md-6">
                            <div className="time-box">
                                <span className="time-value" aria-label={cell.label}>
                                    {String(cell.value).padStart(2, '0')}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
