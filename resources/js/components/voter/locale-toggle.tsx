import { router } from '@inertiajs/react';
import { useT } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { switchMethod } from '@/routes/locale';

const LABELS: Record<string, string> = {
    en: 'EN',
    am: 'አማ',
};

export function LocaleToggle({ tone = 'dark' }: { tone?: 'dark' | 'light' }) {
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
            className={cn(
                'flex items-center rounded-full p-0.5 text-xs font-bold',
                tone === 'dark'
                    ? 'glass'
                    : 'border border-border bg-paper-soft',
            )}
        >
            {Object.entries(LABELS).map(([code, label]) => (
                <button
                    key={code}
                    type="button"
                    onClick={() => setLocale(code)}
                    aria-pressed={locale === code}
                    className={cn(
                        'min-w-10 cursor-pointer rounded-full px-3 py-1.5 transition-colors',
                        locale === code
                            ? 'bg-brand text-white'
                            : tone === 'dark'
                              ? 'text-white/70 hover:text-white'
                              : 'text-mist hover:text-ink',
                    )}
                >
                    {label}
                </button>
            ))}
        </div>
    );
}
