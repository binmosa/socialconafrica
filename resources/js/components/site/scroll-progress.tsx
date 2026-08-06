import { useEffect, useState } from 'react';

const CIRCUMFERENCE = 307.919;

export function ScrollProgress() {
    const [progress, setProgress] = useState(0);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const onScroll = () => {
            const scrollTop = window.scrollY;
            const height = document.documentElement.scrollHeight - window.innerHeight;
            const pct = height > 0 ? scrollTop / height : 0;
            setProgress(pct);
            setVisible(scrollTop > 300);
        };
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    const dashOffset = CIRCUMFERENCE * (1 - progress);

    return (
        <div className="paginacontainer">
            <div
                className={`progress-wrap progress2 ${visible ? 'active-progress' : ''}`}
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && window.scrollTo({ top: 0, behavior: 'smooth' })}
                aria-label="Scroll to top"
            >
                <svg className="progress-circle svg-content" width="100%" height="100%" viewBox="-1 -1 102 102">
                    <path
                        d="M50,1 a49,49 0 0,1 0,98 a49,49 0 0,1 0,-98"
                        style={{
                            strokeDasharray: CIRCUMFERENCE,
                            strokeDashoffset: dashOffset,
                            transition: 'stroke-dashoffset 100ms linear',
                        }}
                    />
                </svg>
            </div>
        </div>
    );
}
