import { router, usePage } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';

import { useT, type Locale } from '@/lib/i18n';

const LANGUAGES: Record<Locale, { code: string; native: string }> = {
    en: { code: 'EN', native: 'English' },
    am: { code: 'አማ', native: 'አማርኛ' },
    fr: { code: 'FR', native: 'Français' },
};

export function LocaleSwitcher() {
    const { locale } = useT();
    const { availableLocales } = usePage().props as unknown as { availableLocales: Locale[] };
    const [open, setOpen] = useState(false);
    const rootRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!open) return;
        const onClickAway = (e: MouseEvent) => {
            if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        const onEscape = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
        document.addEventListener('mousedown', onClickAway);
        document.addEventListener('keydown', onEscape);
        return () => {
            document.removeEventListener('mousedown', onClickAway);
            document.removeEventListener('keydown', onEscape);
        };
    }, [open]);

    const switchTo = (target: Locale) => {
        setOpen(false);
        if (target === locale) return;
        router.post(`/locale/${target}`, {}, { preserveState: false, preserveScroll: false });
    };

    return (
        <div ref={rootRef} className={`sca-lang ${open ? 'open' : ''}`}>
            <button
                type="button"
                className="sca-lang-btn"
                onClick={() => setOpen((current) => !current)}
                aria-haspopup="listbox"
                aria-expanded={open}
            >
                {LANGUAGES[locale]?.code ?? locale.toUpperCase()}
                <i className="fa-solid fa-chevron-down" aria-hidden="true" />
            </button>
            <div className="sca-lang-menu" role="listbox" aria-label="Language">
                {availableLocales.map((code) => (
                    <button
                        key={code}
                        type="button"
                        role="option"
                        aria-selected={code === locale}
                        className={`sca-lang-item ${code === locale ? 'active' : ''}`}
                        onClick={() => switchTo(code)}
                    >
                        {LANGUAGES[code]?.native ?? code}
                        {code === locale && <i className="fa-solid fa-check" aria-hidden="true" />}
                    </button>
                ))}
            </div>
        </div>
    );
}
