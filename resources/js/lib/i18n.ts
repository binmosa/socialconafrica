import { usePage } from '@inertiajs/react';
import { useCallback } from 'react';

export type Locale = 'en' | 'am';

type Translations = Record<string, unknown>;

function lookup(source: Translations | unknown, key: string): unknown {
    return key.split('.').reduce<unknown>((acc, segment) => {
        if (
            acc &&
            typeof acc === 'object' &&
            segment in (acc as Record<string, unknown>)
        ) {
            return (acc as Record<string, unknown>)[segment];
        }

        return undefined;
    }, source);
}

function interpolate(
    value: string,
    replacements: Record<string, string | number>,
): string {
    return Object.entries(replacements).reduce(
        (str, [k, v]) => str.replace(new RegExp(`:${k}`, 'g'), String(v)),
        value,
    );
}

export function useT() {
    const { translations, locale } = usePage().props as unknown as {
        translations: { site: Translations };
        locale: Locale;
    };

    const t = useCallback(
        (
            key: string,
            replacements: Record<string, string | number> = {},
            fallback?: string,
        ): string => {
            const value = lookup(translations.site, key);

            if (typeof value === 'string') {
                return interpolate(value, replacements);
            }

            return fallback ?? key;
        },
        [translations],
    );

    return { t, locale };
}

export function useTranslations<T = unknown>(namespace: string): T | undefined {
    const { translations } = usePage().props as unknown as {
        translations: { site: Translations };
    };

    return lookup(translations.site, namespace) as T | undefined;
}
