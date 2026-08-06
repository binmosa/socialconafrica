import { useEffect, useState } from 'react';

export function Preloader() {
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        const handleLoad = () => window.setTimeout(() => setVisible(false), 400);
        if (document.readyState === 'complete') {
            handleLoad();
        } else {
            window.addEventListener('load', handleLoad, { once: true });
        }
        const fallback = window.setTimeout(() => setVisible(false), 3000);
        return () => {
            window.removeEventListener('load', handleLoad);
            window.clearTimeout(fallback);
        };
    }, []);

    if (!visible) {
        return null;
    }

    return (
        <div className="preloader" style={{ opacity: visible ? 1 : 0, transition: 'opacity 300ms ease' }}>
            <div className="loader" />
        </div>
    );
}
