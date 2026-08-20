import { Head, router } from '@inertiajs/react';
import { Search } from 'lucide-react';
import { useRef } from 'react';
import { index as nomineesIndex } from '@/routes/nominees';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { NomineeCard } from '@/components/voter/nominee-card';
import { useT } from '@/lib/i18n';
import type { CategoryRef, NomineeCardData } from '@/types';

type NomineesIndexProps = {
    nominees: NomineeCardData[];
    categories: CategoryRef[];
    filters: { q: string | null; category: string | null };
};

export default function NomineesIndex({ nominees, categories, filters }: NomineesIndexProps) {
    const { t, locale } = useT();
    const debounce = useRef<ReturnType<typeof setTimeout>>(null);

    const applyFilters = (next: { q?: string | null; category?: string | null }) => {
        const query: Record<string, string> = {};
        const q = next.q !== undefined ? next.q : filters.q;
        const category = next.category !== undefined ? next.category : filters.category;
        if (q) {
            query.q = q;
        }
        if (category) {
            query.category = category;
        }

        router.get(nomineesIndex({ locale }, { query }).url, {}, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const onSearchInput = (value: string) => {
        if (debounce.current) {
            clearTimeout(debounce.current);
        }
        debounce.current = setTimeout(() => applyFilters({ q: value || null }), 350);
    };

    return (
        <>
            <Head title={t('nominees.title')} />

            <section className="mx-auto max-w-6xl px-4 py-10">
                <header className="mb-6">
                    <h1 className="font-display text-3xl font-extrabold tracking-tight">
                        {t('nominees.title')}
                    </h1>
                    <p className="mt-1 text-sm text-mist">{t('nominees.subtitle')}</p>
                </header>

                <div className="relative mb-4 max-w-xl">
                    <Search
                        className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-mist"
                        aria-hidden
                    />
                    <Input
                        type="search"
                        defaultValue={filters.q ?? ''}
                        onChange={(event) => onSearchInput(event.target.value)}
                        placeholder={t('nominees.search_placeholder')}
                        aria-label={t('nominees.search_placeholder')}
                        className="h-11 bg-card pl-9"
                    />
                </div>

                <div
                    className="mb-8 flex flex-wrap gap-2"
                    role="group"
                    aria-label={t('home.categories_title')}
                >
                    <button
                        type="button"
                        onClick={() => applyFilters({ category: null })}
                        className="cursor-pointer"
                    >
                        <Badge variant={filters.category === null ? 'default' : 'secondary'}>
                            {t('nominees.all_categories')}
                        </Badge>
                    </button>
                    {categories.map((category) => (
                        <button
                            key={category.slug}
                            type="button"
                            onClick={() =>
                                applyFilters({
                                    category: filters.category === category.slug ? null : category.slug,
                                })
                            }
                            className="cursor-pointer"
                        >
                            <Badge variant={filters.category === category.slug ? 'default' : 'secondary'}>
                                {category.name}
                            </Badge>
                        </button>
                    ))}
                </div>

                {nominees.length === 0 ? (
                    <p className="rounded-xl border border-border bg-card px-6 py-12 text-center text-sm text-mist">
                        {t('nominees.no_results')}
                    </p>
                ) : (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        {nominees.map((nominee) => (
                            <NomineeCard key={nominee.id} nominee={nominee} />
                        ))}
                    </div>
                )}
            </section>
        </>
    );
}
