import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowRight, Car, Gift, Ticket } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Countdown } from '@/components/voter/countdown';
import { PageHeader } from '@/components/voter/page-header';
import { Reveal } from '@/components/voter/reveal';
import { useT } from '@/lib/i18n';
import { winners } from '@/routes';
import { index as nomineesIndex } from '@/routes/nominees';
import type { SharedData } from '@/types';

export default function Prizes() {
    const { t, locale } = useT();
    const { activeDraw } = usePage<SharedData>().props;

    return (
        <>
            <Head title={t('prizes.title')} />

            <PageHeader
                badge={t('prizes.eyebrow')}
                title={t('prizes.subtitle')}
                subtitle={t('prizes.weekly_body')}
            >
                {activeDraw && (
                    <Countdown
                        until={activeDraw.closes_at}
                        label={`${activeDraw.week_key} · ${t('home.draw_closes')}`}
                    />
                )}
            </PageHeader>

            <section className="mx-auto max-w-6xl px-4 pb-16 md:pb-24">
                <div className="grid gap-5 md:grid-cols-2">
                    <Reveal>
                        <div className="h-full rounded-3xl border border-border/70 bg-white p-7 shadow-lift md:p-9">
                            <p className="inline-flex items-center gap-2 text-[13px] font-semibold tracking-[0.08em] text-violet uppercase">
                                <Gift className="size-4" aria-hidden />
                                {t('prizes.weekly_title')}
                            </p>
                            <h2 className="mt-3 font-display text-3xl font-bold tracking-tight uppercase">
                                {activeDraw
                                    ? activeDraw.week_key
                                    : t('nav.draw')}
                            </h2>
                            {activeDraw ? (
                                <ul className="mt-6 space-y-3">
                                    {activeDraw.prizes.map((prize) => (
                                        <li
                                            key={prize.tier + prize.label}
                                            className="flex items-center justify-between rounded-lg bg-paper-soft px-5 py-3.5"
                                        >
                                            <span className="font-medium">
                                                {prize.label}
                                            </span>
                                            <span className="font-display text-xl font-bold text-gold">
                                                ×{prize.count}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="mt-6 text-ink/60">
                                    {t('winners.empty')}
                                </p>
                            )}
                        </div>
                    </Reveal>

                    <Reveal delay={100}>
                        <div className="relative h-full overflow-hidden rounded-3xl stage p-7 md:p-9">
                            <p className="relative inline-flex items-center gap-2 text-[13px] font-semibold tracking-[0.08em] uppercase">
                                <Car
                                    className="size-4 text-gold-fill"
                                    aria-hidden
                                />
                                {t('prizes.grand_title')}
                            </p>
                            <p className="relative mt-4 font-display text-3xl font-bold md:text-4xl">
                                <span className="text-sunrise">
                                    {t('prizes.grand_body')}
                                </span>
                            </p>
                            <p className="relative mt-5 text-[15px] leading-7 text-white/70">
                                {t('home.road_body')}
                            </p>
                        </div>
                    </Reveal>
                </div>

                <Reveal delay={150}>
                    <div className="mt-6 rounded-2xl bg-brand p-[2px]">
                        <div className="flex flex-col items-center gap-4 rounded-[calc(1rem-2px)] bg-white px-6 py-6 text-center md:flex-row md:text-left">
                            <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-brand text-white">
                                <Ticket className="size-6" aria-hidden />
                            </span>
                            <p className="text-[17px] font-semibold">
                                {t('prizes.entry_rule')}
                            </p>
                        </div>
                    </div>
                </Reveal>

                <Reveal
                    delay={200}
                    className="mt-10 flex flex-wrap justify-center gap-3"
                >
                    <Button asChild size="lg">
                        <Link href={nomineesIndex(locale).url}>
                            {t('prizes.cta')}
                            <ArrowRight className="cta-arrow" aria-hidden />
                        </Link>
                    </Button>
                    <Button asChild size="lg" variant="outline">
                        <Link href={winners(locale).url}>
                            {t('prizes.see_winners')}
                        </Link>
                    </Button>
                </Reveal>
            </section>
        </>
    );
}
