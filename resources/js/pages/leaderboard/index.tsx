import { Head, Link, usePage } from '@inertiajs/react';
import { ChevronDown } from 'lucide-react';
import { NomineeAvatar } from '@/components/voter/nominee-avatar';
import { PageHeader } from '@/components/voter/page-header';
import { useT } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { checkout, leaderboard } from '@/routes';
import { category as leaderboardCategory } from '@/routes/leaderboard';
import { show as nomineeShow } from '@/routes/nominees';
import type { CategoryRef, PublicStanding, SharedData } from '@/types';

type LeaderboardProps = {
    categories: CategoryRef[];
    activeCategory: string | null;
    activeCategoryName: string | null;
    standings: PublicStanding[];
};

const PODIUM: Record<number, string> = {
    1: 'bg-brand text-white',
    2: 'bg-night text-white',
    3: 'bg-gold-fill text-ink',
};

export default function Leaderboard({
    categories,
    activeCategory,
    activeCategoryName,
    standings,
}: LeaderboardProps) {
    const { t, locale } = useT();
    const { pricing, votingWindow } = usePage<SharedData>().props;

    const onCategoryChange = (slug: string) => {
        window.location.assign(
            slug === ''
                ? leaderboard(locale).url
                : leaderboardCategory({ locale, category: slug }).url,
        );
    };

    return (
        <>
            <Head title={t('leaderboard.title')} />

            <PageHeader
                badge={t('leaderboard.live')}
                live
                title={
                    activeCategoryName
                        ? `${t('leaderboard.page_title')} · ${activeCategoryName}`
                        : t('leaderboard.page_title')
                }
                subtitle={t('leaderboard.page_subtitle')}
            >
                <div className="flex flex-wrap items-center gap-2.5">
                    <label className="relative inline-flex items-center rounded-full border border-border bg-white pl-4 text-sm shadow-sm">
                        <span className="text-ink/60">
                            {t('leaderboard.filter_category')}
                        </span>
                        <select
                            value={activeCategory ?? ''}
                            onChange={(event) =>
                                onCategoryChange(event.target.value)
                            }
                            className="cursor-pointer appearance-none bg-transparent py-2.5 pr-9 pl-2 font-semibold text-ink focus:outline-none"
                        >
                            <option value="">{t('leaderboard.overall')}</option>
                            {categories.map((category) => (
                                <option
                                    key={category.slug}
                                    value={category.slug}
                                >
                                    {category.name}
                                </option>
                            ))}
                        </select>
                        <ChevronDown
                            className="pointer-events-none absolute right-3 size-4 text-ink/60"
                            aria-hidden
                        />
                    </label>

                    <nav
                        aria-label={t('home.categories_title')}
                        className="hidden flex-wrap gap-2 lg:flex"
                    >
                        <Link
                            href={leaderboard(locale).url}
                            className={cn(
                                'rounded-full px-3.5 py-2 text-[13px] font-semibold transition-all',
                                activeCategory === null
                                    ? 'bg-brand text-white shadow-glow'
                                    : 'border border-border bg-white text-ink hover:border-ink',
                            )}
                        >
                            {t('leaderboard.overall')}
                        </Link>
                        {categories.map((category) => (
                            <Link
                                key={category.slug}
                                href={
                                    leaderboardCategory({
                                        locale,
                                        category: category.slug,
                                    }).url
                                }
                                className={cn(
                                    'rounded-full px-3.5 py-2 text-[13px] font-semibold transition-all',
                                    activeCategory === category.slug
                                        ? 'bg-brand text-white shadow-glow'
                                        : 'border border-border bg-white text-ink hover:border-ink',
                                )}
                            >
                                {category.name}
                            </Link>
                        ))}
                    </nav>
                </div>
            </PageHeader>

            <section className="mx-auto max-w-6xl px-4 pb-16 md:pb-24">
                <div className="overflow-hidden rounded-3xl border border-border/70 bg-white shadow-lift">
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[33rem] text-sm">
                            <thead className="bg-paper text-[11px] font-semibold tracking-wide text-ink/55 uppercase">
                                <tr>
                                    <th className="px-4 py-3 text-left">
                                        {t('leaderboard.col_rank')}
                                    </th>
                                    <th className="px-4 py-3 text-left">
                                        {t('leaderboard.col_nominee')}
                                    </th>
                                    <th className="hidden px-4 py-3 text-left md:table-cell">
                                        {t('leaderboard.col_category')}
                                    </th>
                                    <th className="hidden px-4 py-3 text-left lg:table-cell">
                                        {t('leaderboard.col_city')}
                                    </th>
                                    <th className="px-4 py-3 text-right">
                                        {t('leaderboard.col_votes')}
                                    </th>
                                    <th className="px-4 py-3 text-right">
                                        {t('leaderboard.col_share')}
                                    </th>
                                    <th className="px-4 py-3 text-right">
                                        <span className="sr-only">
                                            {t('leaderboard.col_action')}
                                        </span>
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {standings.map((row) => (
                                    <tr
                                        key={row.share_slug}
                                        className="border-t border-border/60 transition-colors hover:bg-paper/60"
                                    >
                                        <td className="px-4 py-3">
                                            <span
                                                className={cn(
                                                    'inline-flex size-8 items-center justify-center rounded-full font-display text-sm font-bold tabular-nums',
                                                    PODIUM[row.rank] ??
                                                        'bg-veil text-violet',
                                                )}
                                            >
                                                {row.rank}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <Link
                                                href={
                                                    nomineeShow({
                                                        locale,
                                                        nominee: row.share_slug,
                                                    }).url
                                                }
                                                className="flex items-center gap-3 font-semibold text-ink hover:text-violet"
                                            >
                                                <NomineeAvatar
                                                    name={row.display_name}
                                                    imagePath={row.image_path}
                                                    className="size-9 text-xs"
                                                    ring={row.rank <= 3}
                                                />
                                                <span className="min-w-0">
                                                    <span className="block truncate">
                                                        {row.display_name}
                                                    </span>
                                                    <span className="block truncate text-xs font-normal text-ink/55">
                                                        @{row.handle}
                                                    </span>
                                                </span>
                                            </Link>
                                        </td>
                                        <td className="hidden px-4 py-3 text-ink/80 md:table-cell">
                                            {row.category ?? '—'}
                                        </td>
                                        <td className="hidden px-4 py-3 text-ink/80 lg:table-cell">
                                            {row.city ?? '—'}
                                        </td>
                                        <td className="px-4 py-3 text-right font-display text-base font-bold text-ink tabular-nums">
                                            {row.approx_votes}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <span className="inline-flex items-center justify-end gap-2">
                                                <span
                                                    className="hidden h-1.5 w-20 overflow-hidden rounded-full bg-paper-soft sm:block"
                                                    aria-hidden
                                                >
                                                    <span
                                                        className="block h-full rounded-full bg-brand"
                                                        style={{
                                                            width: `${Math.max(row.share, 2)}%`,
                                                        }}
                                                    />
                                                </span>
                                                <span className="text-xs font-semibold text-ink/80 tabular-nums">
                                                    {row.share_pct}%
                                                </span>
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            {votingWindow.is_open ? (
                                                <Link
                                                    href={
                                                        checkout({
                                                            locale,
                                                            nominee:
                                                                row.share_slug,
                                                        }).url
                                                    }
                                                    className="inline-flex rounded-full bg-brand px-3.5 py-1.5 text-xs font-semibold whitespace-nowrap text-white transition-[filter] hover:brightness-110"
                                                >
                                                    {t('nominees.vote_price', {
                                                        price: pricing.unit_etb,
                                                    })}
                                                </Link>
                                            ) : (
                                                <span className="text-xs text-ink/40">
                                                    {t('hero.opens_soon')}
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <p className="mt-4 text-center text-xs text-ink/55">
                    {t('leaderboard.approx_note')}
                </p>
            </section>
        </>
    );
}
