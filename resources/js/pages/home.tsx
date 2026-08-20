import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowRight, Gift, Search, Ticket, Vote } from 'lucide-react';
import { howToVote, prizes } from '@/routes';
import { index as nomineesIndex, show as nomineeShow } from '@/routes/nominees';
import { Button } from '@/components/ui/button';
import { Countdown } from '@/components/voter/countdown';
import { NomineeAvatar } from '@/components/voter/nominee-avatar';
import { NomineeCard } from '@/components/voter/nominee-card';
import { useT } from '@/lib/i18n';
import type { CategoryRef, NomineeCardData, SharedData } from '@/types';

type HomeProps = {
    categories: (CategoryRef & { id: number; image_path: string | null })[];
    featuredNominees: NomineeCardData[];
    stats: { creators: number; votes: string; categories: number };
};

export default function Home({ categories, featuredNominees, stats }: HomeProps) {
    const { t, locale } = useT();
    const { votingWindow, activeDraw } = usePage<SharedData>().props;

    const steps = [
        { icon: Search, title: t('home.step1_title'), body: t('home.step1_body') },
        { icon: Vote, title: t('home.step2_title'), body: t('home.step2_body') },
        { icon: Ticket, title: t('home.step3_title'), body: t('home.step3_body') },
    ];

    const heroCluster = featuredNominees.slice(0, 5);

    const statItems = [
        { value: String(stats.creators), label: t('home.stats_creators') },
        { value: stats.votes, label: t('home.stats_votes') },
        { value: String(stats.categories), label: t('home.stats_categories') },
    ];

    return (
        <>
            <Head title={t('brand.awards')} />

            {/* Hero */}
            <section className="relative overflow-hidden">
                <div
                    aria-hidden
                    className="absolute inset-0 bg-[radial-gradient(50rem_26rem_at_82%_-6rem,rgb(108_59_244/0.10),transparent),radial-gradient(40rem_22rem_at_-10%_20%,rgb(245_184_46/0.16),transparent)]"
                />
                <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-4 pt-14 pb-14 md:grid-cols-[3fr_2fr] md:pt-20 md:pb-20">
                    <div>
                        <p className="mb-4 text-xs font-semibold tracking-[0.2em] text-violet uppercase">
                            {t('hero.eyebrow')}
                        </p>
                        <h1 className="max-w-3xl font-display text-4xl leading-[1.05] font-extrabold tracking-tight md:text-6xl">
                            {t('hero.title_before')}{' '}
                            <span className="tally-underline">{t('hero.title_highlight')}</span>
                        </h1>
                        <p className="mt-5 max-w-xl text-base text-mist md:text-lg">
                            {t('hero.subtitle')}
                        </p>
                        <div className="mt-8 flex flex-wrap items-center gap-3">
                            <Button asChild size="lg" className="shadow-lift font-semibold">
                                <Link href={nomineesIndex(locale).url}>
                                    {t('hero.cta_vote')}
                                    <ArrowRight aria-hidden />
                                </Link>
                            </Button>
                            <Button asChild size="lg" variant="outline" className="bg-card/60">
                                <Link href={howToVote(locale).url}>{t('hero.cta_how')}</Link>
                            </Button>
                        </div>
                        <div className="mt-10">
                            {votingWindow.is_open && votingWindow.closes_at ? (
                                <Countdown until={votingWindow.closes_at} label={t('hero.closes_in')} />
                            ) : (
                                <p className="shadow-lift inline-flex items-center gap-2 rounded-full border border-border/60 bg-card px-4 py-2 text-sm font-medium text-gold-soft">
                                    <span className="size-2 animate-pulse rounded-full bg-gold-fill" aria-hidden />
                                    {t('hero.opens_soon')}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Creator spotlight cluster */}
                    {heroCluster.length > 0 && (
                        <div className="flex flex-wrap items-center justify-center gap-4 md:justify-end">
                            {heroCluster.map((nominee, index) => (
                                <Link
                                    key={nominee.id}
                                    href={nomineeShow({ locale, nominee: nominee.share_slug }).url}
                                    aria-label={t('nominees.vote_for', { name: nominee.display_name })}
                                    className="transition-transform hover:scale-105"
                                >
                                    <span className="relative inline-flex flex-col items-center gap-1.5">
                                        <NomineeAvatar
                                            name={nominee.display_name}
                                            imagePath={nominee.image_path}
                                            className={index === 0 ? 'size-28 text-3xl' : 'size-18 text-lg'}
                                        />
                                        {nominee.rank != null && (
                                            <span className="bg-spotlight shadow-lift absolute -top-1 -right-1 flex size-6 items-center justify-center rounded-full font-display text-[10px] font-bold text-white">
                                                #{nominee.rank}
                                            </span>
                                        )}
                                        <span className="max-w-24 truncate text-xs font-semibold">
                                            {nominee.display_name}
                                        </span>
                                    </span>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>

                {/* Stats strip */}
                <div className="relative border-y border-border/60 bg-card/70 backdrop-blur">
                    <dl className="mx-auto grid max-w-6xl grid-cols-3 divide-x divide-border/60 px-4">
                        {statItems.map((stat) => (
                            <div key={stat.label} className="px-4 py-5 text-center">
                                <dd className="font-display text-2xl font-extrabold tabular-nums md:text-3xl">
                                    {stat.value}
                                </dd>
                                <dt className="text-[11px] font-medium tracking-wider text-mist uppercase">
                                    {stat.label}
                                </dt>
                            </div>
                        ))}
                    </dl>
                </div>
            </section>

            {/* Categories */}
            <section className="mx-auto max-w-6xl px-4 py-12">
                <header className="mb-6">
                    <h2 className="font-display text-2xl font-bold">{t('home.categories_title')}</h2>
                    <p className="text-sm text-mist">{t('home.categories_subtitle')}</p>
                </header>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                    {categories.map((category) => (
                        <Link
                            key={category.id}
                            href={nomineesIndex({ locale }, { query: { category: category.slug } }).url}
                            className="shadow-lift rounded-2xl border border-border/60 bg-card px-4 py-5 font-display text-sm font-semibold transition-all hover:-translate-y-0.5 hover:border-violet/40 hover:text-violet"
                        >
                            {category.name}
                        </Link>
                    ))}
                </div>
            </section>

            {/* Leading creators */}
            <section className="mx-auto max-w-6xl px-4 py-12">
                <header className="mb-6 flex items-end justify-between gap-4">
                    <div>
                        <h2 className="font-display text-2xl font-bold">{t('home.leading_title')}</h2>
                        <p className="text-sm text-mist">{t('home.leading_subtitle')}</p>
                    </div>
                    <Link
                        href={nomineesIndex(locale).url}
                        className="text-sm font-semibold text-violet hover:underline"
                    >
                        {t('home.view_all')}
                    </Link>
                </header>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {featuredNominees.map((nominee) => (
                        <NomineeCard key={nominee.id} nominee={nominee} />
                    ))}
                </div>
            </section>

            {/* Raffle panel */}
            <section className="mx-auto max-w-6xl px-4 py-12">
                <div className="bg-spotlight shadow-lift rounded-3xl p-[2px]">
                    <div className="flex flex-col gap-6 rounded-[calc(1.5rem-2px)] bg-card p-6 md:flex-row md:items-center md:justify-between md:p-10">
                        <div className="max-w-lg">
                            <p className="mb-2 inline-flex items-center gap-2 text-xs font-semibold tracking-widest text-violet uppercase">
                                <Gift className="size-4" aria-hidden />
                                {activeDraw ? activeDraw.week_key : t('nav.draw')}
                            </p>
                            <h2 className="font-display text-2xl font-bold">{t('home.raffle_title')}</h2>
                            <p className="mt-2 text-sm text-mist">{t('home.raffle_subtitle')}</p>
                            {activeDraw && (
                                <ul className="mt-4 flex flex-wrap gap-2">
                                    {activeDraw.prizes.map((prize) => (
                                        <li
                                            key={prize.tier + prize.label}
                                            className="rounded-full bg-gold-fill/15 px-3 py-1 text-xs font-semibold text-gold-soft"
                                        >
                                            {prize.count}× {prize.label}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                        <Button asChild size="lg" className="shrink-0 font-semibold">
                            <Link href={prizes(locale).url}>{t('home.raffle_cta')}</Link>
                        </Button>
                    </div>
                </div>
            </section>

            {/* How it works */}
            <section className="mx-auto max-w-6xl px-4 py-12">
                <header className="mb-8 max-w-xl">
                    <h2 className="font-display text-2xl font-bold">{t('home.steps_title')}</h2>
                    <p className="text-sm text-mist">{t('home.steps_subtitle')}</p>
                </header>
                <ol className="grid gap-4 md:grid-cols-3">
                    {steps.map((step, index) => {
                        const Icon = step.icon;
                        return (
                            <li
                                key={step.title}
                                className="shadow-lift rounded-2xl border border-border/60 bg-card p-6"
                            >
                                <div className="mb-4 flex items-center gap-3">
                                    <span className="bg-spotlight flex size-10 items-center justify-center rounded-full text-white">
                                        <Icon className="size-5" aria-hidden />
                                    </span>
                                    <span className="font-display text-sm font-bold text-mist">
                                        {String(index + 1).padStart(2, '0')}
                                    </span>
                                </div>
                                <h3 className="font-display text-lg font-bold">{step.title}</h3>
                                <p className="mt-1.5 text-sm text-mist">{step.body}</p>
                            </li>
                        );
                    })}
                </ol>
            </section>

            {/* Road to 2027 */}
            <section className="border-t border-border/60 bg-paper-soft">
                <div className="mx-auto max-w-6xl px-4 py-14 text-center">
                    <h2 className="font-display text-2xl font-bold md:text-3xl">
                        {t('home.road_title')}
                    </h2>
                    <p className="mx-auto mt-3 max-w-2xl text-sm text-mist md:text-base">
                        {t('home.road_body')}
                    </p>
                </div>
            </section>
        </>
    );
}
