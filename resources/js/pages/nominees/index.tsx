import { Head, router, usePage } from '@inertiajs/react';
import { Search } from 'lucide-react';
import { useRef } from 'react';
import { NomineeCard } from '@/components/voter/nominee-card';
import { PageHeader } from '@/components/voter/page-header';
import { Reveal } from '@/components/voter/reveal';
import { useT } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { index as nomineesIndex } from '@/routes/nominees';
import type { CategoryRef, NomineeCardData, SharedData } from '@/types';

type NomineesIndexProps = {
    nominees: NomineeCardData[];
    categories: CategoryRef[];
    filters: { q: string | null; category: string | null };
};

export default function NomineesIndex({
    nominees,
    categories,
    filters,
}: NomineesIndexProps) {
    const { t, locale } = useT();
    const { pricing } = usePage<SharedData>().props;
    const debounce = useRef<ReturnType<typeof setTimeout>>(null);

    const carried: Record<string, string> = {};

    if (typeof window !== 'undefined') {
        const qty = new URLSearchParams(window.location.search).get('qty');

        if (qty) {
            carried.qty = qty;
        }
    }

    const applyFilters = (next: {
        q?: string | null;
        category?: string | null;
    }) => {
        const query: Record<string, string> = { ...carried };
        const q = next.q !== undefined ? next.q : filters.q;
        const category =
            next.category !== undefined ? next.category : filters.category;

        if (q) {
            query.q = q;
        }

        if (category) {
            query.category = category;
        }

        router.get(
            nomineesIndex({ locale }, { query }).url,
            {},
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            },
        );
    };

    const onSearchInput = (value: string) => {
        if (debounce.current) {
            clearTimeout(debounce.current);
        }

        debounce.current = setTimeout(
            () => applyFilters({ q: value || null }),
            350,
        );
    };

    return (
        <>
            <Head title={t('nominees.title')} />

            <PageHeader
                badge={t('nominees.page_badge')}
                title={t('nominees.page_title')}
                subtitle={t('nominees.page_subtitle', {
                    price: pricing.unit_etb,
                })}
            >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
                    <div className="relative w-full lg:max-w-md">
                        <Search
                            className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-ink/50"
                            aria-hidden
                        />
                        <input
                            type="search"
                            defaultValue={filters.q ?? ''}
                            onChange={(event) =>
                                onSearchInput(event.target.value)
                            }
                            placeholder={t('nominees.search_placeholder')}
                            aria-label={t('nominees.search_placeholder')}
                            className="h-12 w-full rounded-full border border-border bg-white pr-5 pl-11 text-sm text-ink shadow-sm placeholder:text-ink/45 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet"
                        />
                    </div>

                    <div
                        className="flex flex-wrap gap-2"
                        role="group"
                        aria-label={t('home.categories_title')}
                    >
                        {[
                            {
                                slug: null as string | null,
                                name: t('nominees.all_categories'),
                            },
                            ...categories,
                        ].map((category) => {
                            const active = filters.category === category.slug;

                            return (
                                <button
                                    key={category.slug ?? 'all'}
                                    type="button"
                                    onClick={() =>
                                        applyFilters({
                                            category:
                                                active && category.slug !== null
                                                    ? null
                                                    : category.slug,
                                        })
                                    }
                                    className={cn(
                                        'cursor-pointer rounded-full px-3.5 py-2 text-[13px] font-semibold transition-all',
                                        active
                                            ? 'bg-brand text-white shadow-glow'
                                            : 'border border-border bg-white text-ink hover:border-ink',
                                    )}
                                >
                                    {category.name}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </PageHeader>

            <section className="mx-auto max-w-6xl px-4 pb-16 md:pb-24">
                <p className="mb-5 text-sm font-semibold text-ink/55">
                    {t('nominees.results', { count: nominees.length })}
                </p>

                {nominees.length === 0 ? (
                    <p className="rounded-3xl border border-border bg-white px-6 py-16 text-center text-ink/60">
                        {t('nominees.no_results')}
                    </p>
                ) : (
                    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                        {nominees.map((nominee, index) => (
                            <Reveal
                                key={nominee.id}
                                delay={(index % 4) * 60}
                                className="h-full"
                            >
                                <NomineeCard
                                    nominee={nominee}
                                    query={carried}
                                />
                            </Reveal>
                        ))}
                    </div>
                )}
            </section>
        </>
    );
}
