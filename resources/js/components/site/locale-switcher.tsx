import { router, usePage } from '@inertiajs/react';

import { useT, type Locale } from '@/lib/i18n';

const LABELS: Record<Locale, string> = {
    en: 'EN',
    am: 'አማ',
    fr: 'FR',
};

export function LocaleSwitcher() {
    const { t, locale } = useT();
    const { availableLocales } = usePage().props as unknown as { availableLocales: Locale[] };

    const switchTo = (target: Locale) => {
        if (target === locale) return;
        router.post(
            `/locale/${target}`,
            {},
            {
                preserveState: false,
                preserveScroll: false,
            },
        );
    };

    return (
        <div className="locale-switcher" role="group" aria-label={t('locale.english')}>
            {availableLocales.map((code) => (
                <button
                    key={code}
                    type="button"
                    onClick={() => switchTo(code)}
                    className={`locale-btn ${code === locale ? 'active' : ''}`}
                    aria-current={code === locale ? 'true' : undefined}
                    style={{
                        background: 'transparent',
                        border: 'none',
                        color: code === locale ? '#FF0A9D' : 'inherit',
                        fontWeight: code === locale ? 700 : 500,
                        padding: '4px 8px',
                        cursor: 'pointer',
                    }}
                >
                    {LABELS[code]}
                </button>
            ))}
        </div>
    );
}
