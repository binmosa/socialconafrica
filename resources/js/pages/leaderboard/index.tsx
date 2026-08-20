import { Head, Link } from '@inertiajs/react';
import { leaderboard } from '@/routes';
import { category as leaderboardCategory } from '@/routes/leaderboard';
import { Badge } from '@/components/ui/badge';
import { NomineeAvatar } from '@/components/voter/nominee-avatar';
import { show as nomineeShow } from '@/routes/nominees';
import { useT } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import type { CategoryRef } from '@/types';

type Standing = {
    rank: number;
    display_name: string;
    handle: string;
    share_slug: string;
    image_path: string | null;
    approx_votes: string;
    share: number;
};

type LeaderboardProps = {
    categories: CategoryRef[];
    activeCategory: string | null;
    activeCategoryName: string | null;
    standings: Standing[];
};

const PODIUM: Record<number, string> = {
    1: 'bg-spotlight text-white',
    2: 'bg-ink/80 text-white',
    3: 'bg-gold-fill text-ink',
};

export default function Leaderboard({
    categories,
    activeCategory,
    activeCategoryName,
    standings,
}: LeaderboardProps) {
    const { t, locale } = useT();

    return (
        <>
            <Head title={t('leaderboard.title')} />

            <section className="mx-auto max-w-3xl px-4 py-10">
                <header className="mb-6">
                    <h1 className="font-display text-3xl font-extrabold tracking-tight">
                        {t('leaderboard.title')}
                        {activeCategoryName ? ` · ${activeCategoryName}` : ''}
                    </h1>
                    <p className="mt-1 text-sm text-mist">{t('leaderboard.subtitle')}</p>
                </header>

                <nav
                    aria-label={t('home.categories_title')}
                    className="mb-6 flex gap-2 overflow-x-auto pb-1"
                >
                    <Link href={leaderboard(locale).url}>
                        <Badge variant={activeCategory === null ? 'default' : 'secondary'}>
                            {t('leaderboard.overall')}
                        </Badge>
                    </Link>
                    {categories.map((category) => (
                        <Link
                            key={category.slug}
                            href={leaderboardCategory({ locale, category: category.slug }).url}
                        >
                            <Badge variant={activeCategory === category.slug ? 'default' : 'secondary'}>
                                {category.name}
                            </Badge>
                        </Link>
                    ))}
                </nav>

                <ol className="space-y-2.5">
                    {standings.map((standing) => (
                        <li key={standing.share_slug}>
                            <Link
                                href={nomineeShow({ locale, nominee: standing.share_slug }).url}
                                className="shadow-lift block rounded-2xl border border-border/60 bg-card px-4 py-3 transition-all hover:-translate-y-0.5 hover:border-violet/40"
                            >
                                <span className="flex items-center gap-3">
                                    <span
                                        className={cn(
                                            'flex size-8 shrink-0 items-center justify-center rounded-full font-display text-sm font-bold tabular-nums',
                                            PODIUM[standing.rank] ?? 'bg-veil text-violet',
                                        )}
                                        aria-label={`${t('nominees.rank')} ${standing.rank}`}
                                    >
                                        {standing.rank}
                                    </span>
                                    <NomineeAvatar
                                        name={standing.display_name}
                                        imagePath={standing.image_path}
                                        className="size-10 text-sm"
                                        ring={standing.rank <= 3}
                                    />
                                    <span className="min-w-0 flex-1">
                                        <span className="block truncate font-semibold">
                                            {standing.display_name}
                                        </span>
                                        <span className="block truncate text-xs text-mist">
                                            @{standing.handle}
                                        </span>
                                    </span>
                                    <span className="text-right">
                                        <span className="block font-display text-base font-extrabold text-gold-soft tabular-nums">
                                            {standing.approx_votes}
                                        </span>
                                        <span className="block text-[10px] tracking-wider text-mist uppercase">
                                            {t('leaderboard.votes_suffix')}
                                        </span>
                                    </span>
                                </span>
                                {/* Momentum bar relative to the leader */}
                                <span
                                    aria-hidden
                                    className="mt-2.5 block h-1.5 overflow-hidden rounded-full bg-paper-soft"
                                >
                                    <span
                                        className="bg-spotlight block h-full rounded-full"
                                        style={{ width: `${Math.max(standing.share, 2)}%` }}
                                    />
                                </span>
                            </Link>
                        </li>
                    ))}
                </ol>

                <p className="mt-4 text-center text-xs text-mist">{t('leaderboard.approx_note')}</p>
            </section>
        </>
    );
}
