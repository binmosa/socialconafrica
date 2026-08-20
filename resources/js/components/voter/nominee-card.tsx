import { Link, usePage } from '@inertiajs/react';
import { Trophy } from 'lucide-react';
import { useInitials } from '@/hooks/use-initials';
import { useT } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { checkout } from '@/routes';
import { show as nomineeShow } from '@/routes/nominees';
import type { NomineeCardData, SharedData } from '@/types';

/** Pastel cover washes, assigned by nominee id so each creator keeps theirs. */
const COVERS = [
    'from-sky-200 to-cyan-300',
    'from-rose-200 to-pink-300',
    'from-lime-200 to-emerald-300',
    'from-amber-200 to-orange-300',
    'from-teal-200 to-emerald-300',
    'from-indigo-200 to-blue-300',
    'from-fuchsia-200 to-pink-300',
    'from-yellow-200 to-amber-300',
];

export function coverFor(id: number): string {
    return COVERS[id % COVERS.length];
}

/**
 * Nominee card: pastel cover (or portrait) with rank + category pills,
 * name, city, approximate votes with share of voice, and a Vote / Profile
 * action pair.
 */
export function NomineeCard({
    nominee,
    query,
    className,
}: {
    nominee: NomineeCardData;
    /** Query params carried onto the creator + checkout pages (e.g. a pre-chosen qty). */
    query?: Record<string, string>;
    className?: string;
}) {
    const { t, locale } = useT();
    const { pricing, votingWindow } = usePage<SharedData>().props;
    const getInitials = useInitials();

    const profileHref = nomineeShow(
        { locale, nominee: nominee.share_slug },
        { query: query ?? {} },
    ).url;
    const voteHref = checkout(
        { locale, nominee: nominee.share_slug },
        { query: query ?? {} },
    ).url;
    const category = nominee.categories[0];

    return (
        <article
            className={cn(
                'group flex h-full flex-col overflow-hidden rounded-3xl border border-border/70 bg-white shadow-lift transition-transform duration-300 hover:-translate-y-1',
                className,
            )}
        >
            <div
                className={cn(
                    'relative aspect-[4/3] bg-gradient-to-br',
                    coverFor(nominee.id),
                )}
            >
                {nominee.image_path ? (
                    <img
                        src={nominee.image_path}
                        alt={nominee.display_name}
                        className="absolute inset-0 size-full object-cover"
                    />
                ) : (
                    <div className="absolute inset-0 grid place-items-center">
                        <span className="font-display text-6xl font-bold text-white/95 drop-shadow-[0_6px_18px_rgb(0_0_0/0.18)] md:text-7xl">
                            {getInitials(nominee.display_name)}
                        </span>
                    </div>
                )}

                {nominee.rank != null && (
                    <span className="absolute top-3 left-3 inline-flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-xs font-bold text-ink shadow-sm">
                        <Trophy
                            className={cn(
                                'size-3.5',
                                nominee.rank <= 3 ? 'text-gold' : 'text-ink/50',
                            )}
                            aria-hidden
                        />
                        #{nominee.rank}
                    </span>
                )}
                {category && (
                    <span className="absolute top-3 right-3 rounded-full bg-brand px-2.5 py-1 text-[11px] font-semibold text-white shadow-sm">
                        {category.name}
                    </span>
                )}
            </div>

            <div className="flex flex-1 flex-col p-5">
                <h3 className="font-display text-lg font-bold text-ink">
                    <Link href={profileHref} className="hover:text-violet">
                        {nominee.display_name}
                    </Link>
                </h3>
                <p className="text-xs text-ink/60">
                    {nominee.city ?? `@${nominee.handle}`}
                </p>

                <div className="mt-3 flex items-end justify-between">
                    <div>
                        <div className="font-display text-2xl font-bold text-violet tabular-nums">
                            {nominee.approx_votes ?? '0'}
                        </div>
                        <div className="text-[11px] font-medium tracking-wide text-ink/60 uppercase">
                            {t('nominees.votes')}
                        </div>
                    </div>
                    {nominee.share_pct != null && nominee.share_pct > 0 && (
                        <span className="rounded-full bg-veil px-2.5 py-0.5 text-[11px] font-semibold text-violet">
                            {nominee.share_pct}% {t('nominees.share_of_votes')}
                        </span>
                    )}
                </div>

                <div className="mt-5 flex gap-2">
                    {votingWindow.is_open ? (
                        <Link
                            href={voteHref}
                            className="flex flex-1 items-center justify-center rounded-full bg-brand px-4 py-2.5 text-sm font-semibold text-white shadow-glow transition-[filter] hover:brightness-110"
                        >
                            {t('nominees.vote_price', {
                                price: pricing.unit_etb,
                            })}
                        </Link>
                    ) : (
                        <span className="flex flex-1 items-center justify-center rounded-full bg-paper-soft px-4 py-2.5 text-sm font-semibold text-ink/50">
                            {t('hero.opens_soon')}
                        </span>
                    )}
                    <Link
                        href={profileHref}
                        className="rounded-full border border-border bg-white px-4 py-2.5 text-sm font-semibold text-ink transition-colors hover:border-ink"
                    >
                        {t('nominees.profile')}
                    </Link>
                </div>
            </div>
        </article>
    );
}
