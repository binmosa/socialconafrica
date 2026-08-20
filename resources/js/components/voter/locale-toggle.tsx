import { router } from '@inertiajs/react';
import { switchMethod } from '@/routes/locale';
import { useT } from '@/lib/i18n';
import { cn } from '@/lib/utils';

const LABELS: Record<string, string> = {
    en: 'EN',
    am: 'አማ',
};

export function LocaleToggle() {
    const { locale } = useT();

    const setLocale = (target: string) => {
        if (target === locale) {
            return;
        }
        router.post(switchMethod(target).url, {}, { preserveScroll: true });
    };

    return (
        <div
            role="group"
            aria-label="Language"
            className="flex items-center rounded-full border border-border bg-secondary/60 p-0.5 text-xs font-semibold"
        >
            {Object.entries(LABELS).map(([code, label]) => (
                <button
                    key={code}
                    type="button"
                    onClick={() => setLocale(code)}
                    aria-pressed={locale === code}
                    className={cn(
                        'min-w-11 rounded-full px-3 py-1.5 transition-colors',
                        locale === code
                            ? 'bg-gold-fill text-ink'
                            : 'text-mist hover:text-foreground',
                    )}
                >
                    {label}
                </button>
            ))}
        </div>
    );
}
