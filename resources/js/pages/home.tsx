import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    ArrowRight,
    Camera,
    Check,
    Dumbbell,
    Laptop,
    Laugh,
    Music,
    Plane,
    Search,
    Shirt,
    Sparkles,
    Ticket,
    Utensils,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Countdown } from '@/components/voter/countdown';
import { CreatorPinwheel } from '@/components/voter/creator-pinwheel';
import { FaqAccordion } from '@/components/voter/faq-accordion';
import { NomineeAvatar } from '@/components/voter/nominee-avatar';
import { NomineeCard } from '@/components/voter/nominee-card';
import { PinwheelGlyph } from '@/components/voter/pinwheel-glyph';
import { Reveal } from '@/components/voter/reveal';
import { SectionHeading } from '@/components/voter/section-heading';
import { useT } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { howToVote, leaderboard, prizes } from '@/routes';
import { category as leaderboardCategory } from '@/routes/leaderboard';
import { index as nomineesIndex, show as nomineeShow } from '@/routes/nominees';
import type {
    CategoryRef,
    NomineeCardData,
    PublicStanding,
    SharedData,
} from '@/types';

type CategoryHighlight = CategoryRef & {
    count: number;
    nominees: PublicStanding[];
};

type HomeProps = {
    categories: (CategoryRef & { id: number; image_path: string | null })[];
    featuredNominees: NomineeCardData[];
    standings: PublicStanding[];
    categoryHighlights: CategoryHighlight[];
    stats: { creators: number; votes: string; categories: number };
};

const CATEGORY_ICONS: [string, LucideIcon][] = [
    ['tech', Laptop],
    ['food', Utensils],
    ['comedy', Laugh],
    ['fashion', Shirt],
    ['fitness', Dumbbell],
    ['health', Dumbbell],
    ['music', Music],
    ['travel', Plane],
    ['lifestyle', Camera],
];

function categoryIcon(slug: string): LucideIcon {
    return CATEGORY_ICONS.find(([key]) => slug.includes(key))?.[1] ?? Sparkles;
}

const PACKAGES = [1, 5, 10, 25];
const UNIT_ETB = 10;

export default function Home({
    featuredNominees,
    standings,
    categoryHighlights,
    stats,
}: HomeProps) {
    const { t, locale } = useT();
    const { votingWindow, activeDraw } = usePage<SharedData>().props;
    const [activeCategory, setActiveCategory] = useState(
        categoryHighlights[0]?.slug ?? null,
    );
    const highlight =
        categoryHighlights.find((c) => c.slug === activeCategory) ??
        categoryHighlights[0];

    const weeklyWinners = activeDraw
        ? activeDraw.prizes.reduce((sum, prize) => sum + prize.count, 0)
        : 8;

    const heroStats = [
        { value: String(stats.creators), label: t('home.stats_creators') },
        { value: String(stats.categories), label: t('home.stats_categories') },
        { value: String(weeklyWinners), label: t('home.stats_winners') },
        {
            value: `${UNIT_ETB} ${t('common.etb')}`,
            label: t('home.stats_price'),
        },
    ];

    const aboutPoints = [
        t('home.about_point1'),
        t('home.about_point2'),
        t('home.about_point3'),
        t('home.about_point4'),
    ];

    const faqItems = [1, 2, 3, 4, 5].map((n) => ({
        question: t(`faq.q${n}`),
        answer: t(`faq.a${n}`),
    }));

    const search = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const q = new FormData(event.currentTarget).get('q');
        router.get(
            nomineesIndex({ locale }, { query: q ? { q: String(q) } : {} }).url,
        );
    };

    return (
        <>
            <Head title={t('brand.awards')} />

            {/* ============================== HERO ============================== */}
            <section className="relative overflow-hidden stage">
                <div className="relative mx-auto max-w-6xl px-4 pt-12 pb-10 md:pt-20 md:pb-16">
                    <div className="mx-auto max-w-4xl animate-rise text-center">
                        <p className="inline-flex items-center gap-2 text-[13px] font-semibold tracking-[0.08em] uppercase">
                            <PinwheelGlyph className="size-[18px] text-gold-fill" />
                            {t('hero.eyebrow')}
                        </p>
                        <h1 className="mt-5 font-display text-display-xl font-bold">
                            {t('hero.title_before')}{' '}
                            <span className="text-sunrise">
                                {t('hero.title_highlight')}
                            </span>
                        </h1>
                    </div>

                    <div className="mt-10 grid items-center gap-10 md:mt-14 lg:grid-cols-[1fr_1.35fr_1fr] lg:gap-8">
                        {/* Left: countdown + venue box */}
                        <Reveal delay={100} className="order-2 lg:order-1">
                            {votingWindow.is_open && votingWindow.closes_at ? (
                                <Countdown
                                    until={votingWindow.closes_at}
                                    label={t('hero.closes_in')}
                                    tone="dark"
                                    size="lg"
                                />
                            ) : (
                                <p className="inline-flex items-center gap-2 rounded-lg glass px-4 py-2.5 text-sm font-semibold">
                                    <span
                                        className="size-2 animate-pulse rounded-full bg-gold-fill"
                                        aria-hidden
                                    />
                                    {t('hero.opens_soon')}
                                </p>
                            )}
                            <div className="mt-6 flex items-start gap-3 rounded-lg glass p-4">
                                <PinwheelGlyph className="mt-0.5 size-5 shrink-0 text-gold-fill" />
                                <p className="text-sm leading-6 font-semibold">
                                    {t('hero.powered_by')}
                                </p>
                            </div>
                        </Reveal>

                        {/* Center: creator pinwheel */}
                        <div className="order-1 lg:order-2">
                            <CreatorPinwheel
                                nominees={featuredNominees}
                                centerHref={nomineesIndex(locale).url}
                            />
                        </div>

                        {/* Right: copy + CTA + stat box */}
                        <Reveal delay={200} className="order-3">
                            <p className="text-[17px] leading-7 text-white/70">
                                {t('hero.subtitle')}
                            </p>
                            <div className="mt-7 flex flex-wrap gap-3">
                                <Button asChild size="lg">
                                    <Link href={nomineesIndex(locale).url}>
                                        {t('hero.cta_vote')}
                                        <ArrowRight
                                            className="cta-arrow"
                                            aria-hidden
                                        />
                                    </Link>
                                </Button>
                                <Button asChild size="lg" variant="glass">
                                    <Link href={howToVote(locale).url}>
                                        {t('hero.cta_how')}
                                    </Link>
                                </Button>
                            </div>
                            <div className="mt-7 rounded-lg border border-white/10 bg-night-soft p-5 text-center">
                                <p className="text-lg font-bold">
                                    {t('hero.votes_so_far')}
                                </p>
                                <p className="mt-2 font-display text-6xl font-bold text-gold-fill tabular-nums md:text-7xl">
                                    {stats.votes}
                                </p>
                            </div>
                        </Reveal>
                    </div>

                    {/* Stats row */}
                    <Reveal delay={250} className="mt-12 md:mt-16">
                        <dl className="grid grid-cols-2 gap-3 md:grid-cols-4">
                            {heroStats.map((stat) => (
                                <div
                                    key={stat.label}
                                    className="rounded-lg glass px-4 py-4 text-center"
                                >
                                    <dd className="font-display text-3xl font-bold tabular-nums">
                                        {stat.value}
                                    </dd>
                                    <dt className="mt-1 text-[11px] font-semibold tracking-[0.14em] text-white/60 uppercase">
                                        {stat.label}
                                    </dt>
                                </div>
                            ))}
                        </dl>
                    </Reveal>
                </div>
            </section>

            {/* ============================== ABOUT ============================== */}
            <section className="bg-white py-16 md:py-28">
                <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 lg:grid-cols-2">
                    {/* Live standings card */}
                    <Reveal>
                        <div className="rounded-lg bg-paper-soft p-5 md:p-8">
                            <div className="flex items-center justify-between">
                                <p className="inline-flex items-center gap-2 text-[13px] font-semibold tracking-[0.08em] uppercase">
                                    <span
                                        className="size-2 animate-pulse rounded-full bg-ember"
                                        aria-hidden
                                    />
                                    {t('home.live_title')}
                                </p>
                                <Link
                                    href={leaderboard(locale).url}
                                    className="text-sm font-semibold text-violet hover:text-pink"
                                >
                                    {t('home.live_link')}
                                </Link>
                            </div>
                            <ol className="mt-5 space-y-3">
                                {standings.map((row) => (
                                    <li key={row.share_slug}>
                                        <Link
                                            href={
                                                nomineeShow({
                                                    locale,
                                                    nominee: row.share_slug,
                                                }).url
                                            }
                                            className="block rounded-lg bg-white px-4 py-3 transition-transform hover:-translate-y-0.5"
                                        >
                                            <span className="flex items-center gap-3">
                                                <span
                                                    className={cn(
                                                        'flex size-8 shrink-0 items-center justify-center rounded-full font-display text-sm font-bold tabular-nums',
                                                        row.rank <= 3
                                                            ? 'bg-brand text-white'
                                                            : 'bg-paper-soft text-ink',
                                                    )}
                                                >
                                                    {row.rank}
                                                </span>
                                                <NomineeAvatar
                                                    name={row.display_name}
                                                    imagePath={row.image_path}
                                                    className="size-10 text-sm"
                                                    ring={row.rank <= 3}
                                                />
                                                <span className="min-w-0 flex-1">
                                                    <span className="block truncate font-semibold">
                                                        {row.display_name}
                                                    </span>
                                                    <span className="block truncate text-xs text-ink/60">
                                                        @{row.handle}
                                                    </span>
                                                </span>
                                                <span className="font-display text-base font-bold text-gold-soft tabular-nums">
                                                    {row.approx_votes}
                                                </span>
                                            </span>
                                            <span
                                                aria-hidden
                                                className="mt-2.5 block h-1.5 overflow-hidden rounded-full bg-paper-soft"
                                            >
                                                <span
                                                    className="block h-full rounded-full bg-brand"
                                                    style={{
                                                        width: `${Math.max(row.share, 2)}%`,
                                                    }}
                                                />
                                            </span>
                                        </Link>
                                    </li>
                                ))}
                            </ol>
                        </div>
                    </Reveal>

                    <div>
                        <SectionHeading
                            align="start"
                            eyebrow={t('home.about_eyebrow')}
                            title={t('home.about_title')}
                            body={
                                t('brand.partner_note') +
                                ' ' +
                                t('home.road_body')
                            }
                        />
                        <Reveal delay={120} className="mt-7">
                            <h3 className="text-xl font-semibold">
                                {t('home.about_highlights')}
                            </h3>
                            <ul className="mt-4 space-y-4">
                                {aboutPoints.map((point) => (
                                    <li
                                        key={point}
                                        className="flex items-start gap-3 text-[17px] font-medium"
                                    >
                                        <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-brand text-white">
                                            <Check
                                                className="size-3.5"
                                                aria-hidden
                                            />
                                        </span>
                                        {point}
                                    </li>
                                ))}
                            </ul>
                            <Button asChild size="lg" className="mt-8">
                                <Link href={howToVote(locale).url}>
                                    {t('hero.cta_how')}
                                    <ArrowRight
                                        className="cta-arrow"
                                        aria-hidden
                                    />
                                </Link>
                            </Button>
                        </Reveal>
                    </div>
                </div>
            </section>

            {/* ============================== CATEGORIES (icon pills + panel) ============================== */}
            <section className="bg-paper-soft py-16 md:py-28">
                <div className="mx-auto max-w-6xl px-4">
                    <SectionHeading
                        eyebrow={t('home.categories_eyebrow')}
                        title={t('home.categories_subtitle')}
                        className="mb-8"
                    />

                    {/* Compact icon pills — horizontally scrollable on phones, wrapped + centered on larger screens */}
                    <Reveal>
                        <div
                            role="tablist"
                            aria-label={t('home.categories_title')}
                            className="-mx-4 flex snap-x [scrollbar-width:none] gap-2 overflow-x-auto px-4 pb-2 md:mx-0 md:flex-wrap md:justify-center md:overflow-visible md:px-0 [&::-webkit-scrollbar]:hidden"
                        >
                            {categoryHighlights.map((category) => {
                                const Icon = categoryIcon(category.slug);
                                const active =
                                    category.slug === highlight?.slug;

                                return (
                                    <button
                                        key={category.slug}
                                        type="button"
                                        role="tab"
                                        aria-selected={active}
                                        onClick={() =>
                                            setActiveCategory(category.slug)
                                        }
                                        className={cn(
                                            'inline-flex shrink-0 cursor-pointer snap-start items-center gap-2 rounded-full py-2 pr-2 pl-3 text-sm font-semibold transition-all',
                                            active
                                                ? 'bg-brand text-white shadow-glow'
                                                : 'border border-border bg-white text-ink hover:border-ink',
                                        )}
                                    >
                                        <Icon
                                            className={cn(
                                                'size-4',
                                                active
                                                    ? 'text-white'
                                                    : 'text-violet',
                                            )}
                                            aria-hidden
                                        />
                                        {category.name}
                                        <span
                                            className={cn(
                                                'min-w-6 rounded-full px-1.5 py-0.5 text-center text-[11px] font-bold tabular-nums',
                                                active
                                                    ? 'bg-white/20 text-white'
                                                    : 'bg-veil text-violet',
                                            )}
                                        >
                                            {category.count}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </Reveal>

                    {highlight && (
                        <Reveal delay={80}>
                            <div
                                key={highlight.slug}
                                className="mt-6 animate-in rounded-3xl border border-border/70 bg-white p-5 shadow-lift duration-500 fade-in slide-in-from-bottom-4 md:p-8"
                            >
                                <div className="flex flex-wrap items-end justify-between gap-3">
                                    <div>
                                        <p className="text-[13px] font-semibold tracking-[0.08em] text-violet uppercase">
                                            {t('home.category_count', {
                                                count: highlight.count,
                                            })}
                                        </p>
                                        <h3 className="mt-1 font-display text-2xl font-semibold md:text-3xl">
                                            {t('home.category_top', {
                                                name: highlight.name,
                                            })}
                                        </h3>
                                    </div>
                                    <Link
                                        href={
                                            leaderboardCategory({
                                                locale,
                                                category: highlight.slug,
                                            }).url
                                        }
                                        className="text-sm font-semibold text-violet hover:text-pink"
                                    >
                                        {t('home.category_leaderboard')}
                                    </Link>
                                </div>

                                {highlight.nominees.length === 0 ? (
                                    <p className="mt-6 rounded-2xl bg-paper-soft px-5 py-8 text-center text-ink/60">
                                        {t('home.category_empty')}
                                    </p>
                                ) : (
                                    <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                                        {highlight.nominees.map((row) => (
                                            <li key={row.share_slug}>
                                                <Link
                                                    href={
                                                        nomineeShow({
                                                            locale,
                                                            nominee:
                                                                row.share_slug,
                                                        }).url
                                                    }
                                                    className="group flex h-full flex-col items-center gap-3 rounded-2xl bg-paper-soft p-5 text-center transition-colors hover:bg-veil"
                                                >
                                                    <NomineeAvatar
                                                        name={row.display_name}
                                                        imagePath={
                                                            row.image_path
                                                        }
                                                        className="size-16 text-lg"
                                                        ring={row.rank <= 3}
                                                    />
                                                    <span className="min-w-0">
                                                        <span className="block truncate font-display font-semibold group-hover:text-violet">
                                                            {row.display_name}
                                                        </span>
                                                        <span className="block text-xs text-ink/60">
                                                            #{row.rank} ·{' '}
                                                            {row.approx_votes}{' '}
                                                            {t(
                                                                'nominees.votes',
                                                            )}
                                                        </span>
                                                    </span>
                                                    <span className="mt-auto inline-flex items-center gap-1 text-xs font-semibold text-violet">
                                                        {t('common.vote')}
                                                        <ArrowRight
                                                            className="size-3.5"
                                                            aria-hidden
                                                        />
                                                    </span>
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                )}

                                <div className="mt-7 text-center">
                                    <Button
                                        asChild
                                        size="lg"
                                        className="rounded-full"
                                    >
                                        <Link
                                            href={
                                                nomineesIndex(
                                                    { locale },
                                                    {
                                                        query: {
                                                            category:
                                                                highlight.slug,
                                                        },
                                                    },
                                                ).url
                                            }
                                        >
                                            {t('home.category_browse', {
                                                name: highlight.name,
                                            })}
                                            <ArrowRight
                                                className="cta-arrow"
                                                aria-hidden
                                            />
                                        </Link>
                                    </Button>
                                </div>
                            </div>
                        </Reveal>
                    )}
                </div>
            </section>

            {/* ============================== LEADING CREATORS ============================== */}
            <section className="bg-white py-16 md:py-28">
                <div className="mx-auto max-w-6xl px-4">
                    <SectionHeading
                        eyebrow={t('home.leading_eyebrow')}
                        title={t('home.leading_title')}
                        body={t('home.leading_subtitle')}
                        className="mb-12"
                    />
                    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                        {featuredNominees.map((nominee, index) => (
                            <Reveal
                                key={nominee.id}
                                delay={(index % 4) * 60}
                                className="h-full"
                            >
                                <NomineeCard nominee={nominee} />
                            </Reveal>
                        ))}
                    </div>
                    <Reveal className="mt-12 text-center">
                        <Button asChild size="lg" variant="outline">
                            <Link href={nomineesIndex(locale).url}>
                                {t('home.view_all')}
                                <ArrowRight className="cta-arrow" aria-hidden />
                            </Link>
                        </Button>
                    </Reveal>
                </div>
            </section>

            {/* ============================== WEEKLY DRAW (night stage) ============================== */}
            <section className="relative overflow-hidden stage py-16 md:py-28">
                <div className="relative mx-auto max-w-6xl px-4">
                    <SectionHeading
                        tone="dark"
                        eyebrow={t('home.draw_eyebrow')}
                        title={t('home.packages_title')}
                        body={t('home.packages_body')}
                        className="mb-12"
                    />

                    {/* Package pills */}
                    <Reveal>
                        <ul className="flex flex-wrap justify-center gap-4">
                            {PACKAGES.map((qty, index) => (
                                <li key={qty}>
                                    <Link
                                        href={
                                            nomineesIndex(
                                                { locale },
                                                { query: { qty: String(qty) } },
                                            ).url
                                        }
                                        className={cn(
                                            'block min-w-[9.5rem] rounded-2xl px-8 py-4 text-center transition-transform hover:-translate-y-1',
                                            index === 1
                                                ? 'bg-brand text-white shadow-glow'
                                                : 'bg-white text-ink',
                                        )}
                                    >
                                        <span className="block font-display text-lg font-semibold">
                                            {qty}{' '}
                                            {qty === 1
                                                ? t('checkout.vote_unit')
                                                : t('checkout.votes_unit')}
                                        </span>
                                        <span className="mt-2 block font-display text-4xl font-bold tracking-tight tabular-nums md:text-5xl">
                                            {qty * UNIT_ETB}
                                            <span className="ml-1 text-base font-semibold">
                                                {t('common.etb')}
                                            </span>
                                        </span>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </Reveal>

                    {/* Glass cards */}
                    <div className="mt-10 grid gap-5 md:grid-cols-3">
                        <Reveal delay={80}>
                            <div className="h-full rounded-2xl glass p-7 text-center">
                                <h3 className="font-display text-2xl font-bold tracking-tight uppercase">
                                    {t('home.draw_prizes')}
                                </h3>
                                {activeDraw ? (
                                    <ul className="mt-6 space-y-3">
                                        {activeDraw.prizes.map((prize) => (
                                            <li
                                                key={prize.tier + prize.label}
                                                className="flex items-center justify-between rounded-lg bg-white/5 px-4 py-2.5"
                                            >
                                                <span className="font-medium">
                                                    {prize.label}
                                                </span>
                                                <span className="font-display text-lg font-bold text-gold-fill">
                                                    ×{prize.count}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="mt-6 text-white/70">
                                        {t('prizes.weekly_body')}
                                    </p>
                                )}
                                <Button
                                    asChild
                                    variant="glass"
                                    className="mt-7 w-full"
                                >
                                    <Link href={prizes(locale).url}>
                                        {t('home.raffle_cta')}
                                        <ArrowRight
                                            className="cta-arrow"
                                            aria-hidden
                                        />
                                    </Link>
                                </Button>
                            </div>
                        </Reveal>

                        <Reveal delay={160}>
                            <div className="flex h-full flex-col items-center rounded-2xl glass p-7 text-center">
                                <h3 className="font-display text-2xl font-bold tracking-tight uppercase">
                                    {activeDraw
                                        ? activeDraw.week_key
                                        : t('nav.draw')}
                                </h3>
                                {activeDraw ? (
                                    <Countdown
                                        until={activeDraw.closes_at}
                                        label={t('home.draw_closes')}
                                        tone="dark"
                                        className="mt-6"
                                    />
                                ) : (
                                    <p className="mt-6 text-white/70">
                                        {t('winners.empty')}
                                    </p>
                                )}
                                <p className="mt-6 text-sm leading-6 text-white/70">
                                    {t('home.raffle_subtitle')}
                                </p>
                            </div>
                        </Reveal>

                        <Reveal delay={240}>
                            <div className="flex h-full flex-col rounded-2xl glass p-7 text-center">
                                <h3 className="font-display text-2xl font-bold tracking-tight uppercase">
                                    {t('home.draw_how')}
                                </h3>
                                <Ticket
                                    className="mx-auto mt-6 size-12 text-gold-fill"
                                    aria-hidden
                                />
                                <p className="mt-5 text-[15px] leading-7 text-white/80">
                                    {t('prizes.entry_rule')}
                                </p>
                                <div className="mt-auto pt-7">
                                    <Button asChild className="w-full">
                                        <Link href={nomineesIndex(locale).url}>
                                            {t('prizes.cta')}
                                            <ArrowRight
                                                className="cta-arrow"
                                                aria-hidden
                                            />
                                        </Link>
                                    </Button>
                                </div>
                            </div>
                        </Reveal>
                    </div>
                </div>
            </section>

            {/* ============================== PARTNERS ============================== */}
            <section className="bg-white py-16 md:py-24">
                <div className="mx-auto max-w-6xl px-4">
                    <SectionHeading
                        eyebrow={t('home.partners_eyebrow')}
                        title={t('home.partners_title')}
                        className="mb-10"
                    />
                    <div className="grid gap-5 md:grid-cols-2">
                        {[
                            {
                                name: 'SocialCon Africa',
                                role: t('home.partner_organizer'),
                            },
                            {
                                name: 'SantimPay',
                                role: t('home.partner_fintech'),
                            },
                        ].map((partner, index) => (
                            <Reveal key={partner.name} delay={index * 100}>
                                <div className="group sweep rounded-lg bg-paper-soft px-8 py-9 text-center transition-colors">
                                    <p className="font-display text-3xl font-bold tracking-tight transition-colors group-hover:text-white">
                                        {partner.name}
                                    </p>
                                    <p className="mt-2 text-sm font-semibold tracking-[0.12em] text-ink/60 uppercase transition-colors group-hover:text-white/80">
                                        {partner.role}
                                    </p>
                                </div>
                            </Reveal>
                        ))}
                    </div>
                </div>
            </section>

            {/* ============================== FAQ ============================== */}
            <section className="bg-paper-soft py-16 md:py-28">
                <div className="mx-auto max-w-4xl px-4">
                    <SectionHeading
                        eyebrow={t('home.faq_eyebrow')}
                        title={t('home.faq_title')}
                        className="mb-12"
                    />
                    <Reveal>
                        <FaqAccordion items={faqItems} />
                    </Reveal>
                </div>
            </section>

            {/* ============================== CTA ============================== */}
            <section className="relative overflow-hidden stage py-16 md:py-24">
                <div className="relative mx-auto max-w-3xl px-4 text-center">
                    <Reveal>
                        <h2 className="font-display text-display-lg font-bold">
                            {t('home.cta_title')}
                        </h2>
                        <p className="mx-auto mt-5 max-w-2xl text-[17px] leading-7 text-white/80">
                            {t('home.cta_body')}
                        </p>
                        <form
                            onSubmit={search}
                            className="relative mx-auto mt-8 max-w-xl"
                        >
                            <label htmlFor="cta-search" className="sr-only">
                                {t('footer.find_creator')}
                            </label>
                            <Search
                                className="pointer-events-none absolute top-1/2 left-5 size-5 -translate-y-1/2 text-white/60"
                                aria-hidden
                            />
                            <input
                                id="cta-search"
                                name="q"
                                type="search"
                                placeholder={t('nominees.search_placeholder')}
                                className="h-16 w-full rounded-lg glass pr-40 pl-13 text-base text-white placeholder:text-white/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet"
                            />
                            <Button
                                type="submit"
                                className="absolute top-1/2 right-2 -translate-y-1/2"
                            >
                                {t('hero.cta_vote')}
                                <ArrowRight className="cta-arrow" aria-hidden />
                            </Button>
                        </form>
                    </Reveal>
                </div>
            </section>
        </>
    );
}
