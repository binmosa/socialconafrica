import { useEffect, useRef, useState } from 'react';

interface Props {
    /** Display value, e.g. "55", "100+", "200+" — counts the numeric part, keeps the suffix. */
    value: string;
    durationMs?: number;
}

export function CountUp({ value, durationMs = 1400 }: Props) {
    const match = value.match(/^(\d+)(.*)$/);
    const target = match ? parseInt(match[1], 10) : null;
    const suffix = match ? match[2] : '';

    const ref = useRef<HTMLSpanElement>(null);
    const [current, setCurrent] = useState(0);
    const [started, setStarted] = useState(false);

    useEffect(() => {
        if (target === null || !ref.current) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries.some((entry) => entry.isIntersecting)) {
                    setStarted(true);
                    observer.disconnect();
                }
            },
            { threshold: 0.4 },
        );
        observer.observe(ref.current);
        return () => observer.disconnect();
    }, [target]);

    useEffect(() => {
        if (!started || target === null) return;

        const startedAt = performance.now();
        let frame = 0;

        const tick = (now: number) => {
            const progress = Math.min((now - startedAt) / durationMs, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCurrent(Math.round(eased * target));
            if (progress < 1) {
                frame = requestAnimationFrame(tick);
            }
        };

        frame = requestAnimationFrame(tick);
        // Guarantee the final value even if rAF is throttled (hidden tab).
        const failSafe = window.setTimeout(() => setCurrent(target), durationMs + 200);

        return () => {
            cancelAnimationFrame(frame);
            window.clearTimeout(failSafe);
        };
    }, [started, target, durationMs]);

    if (target === null) {
        return <span>{value}</span>;
    }

    return (
        <span ref={ref}>
            {started ? current : 0}
            {suffix}
        </span>
    );
}
