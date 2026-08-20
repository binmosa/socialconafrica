import { Head, Link, usePage } from '@inertiajs/react';
import { Car, Gift } from 'lucide-react';
import { winners } from '@/routes';
import { index as nomineesIndex } from '@/routes/nominees';
import { Button } from '@/components/ui/button';
import { useT } from '@/lib/i18n';
import type { SharedData } from '@/types';

export default function Prizes() {
    const { t, locale } = useT();
    const { activeDraw } = usePage<SharedData>().props;

    return (
        <>
            <Head title={t('prizes.title')} />

            <section className="mx-auto max-w-4xl px-4 py-12">
                <header className="mb-10 text-center">
                    <h1 className="font-display text-3xl font-extrabold tracking-tight md:text-4xl">
                        {t('prizes.title')}
                    </h1>
                    <p className="mt-3 text-sm text-mist md:text-base">{t('prizes.subtitle')}</p>
                </header>

                <div className="grid gap-4 md:grid-cols-2">
                    <div className="shadow-lift rounded-2xl border border-border/60 bg-card p-7">
                        <p className="mb-3 inline-flex items-center gap-2 text-xs font-semibold tracking-widest text-violet uppercase">
                            <Gift className="size-4" aria-hidden />
                            {t('prizes.weekly_title')}
                        </p>
                        <p className="text-sm text-mist">{t('prizes.weekly_body')}</p>
                        {activeDraw && (
                            <ul className="mt-5 space-y-2">
                                {activeDraw.prizes.map((prize) => (
                                    <li
                                        key={prize.tier + prize.label}
                                        className="flex items-center justify-between rounded-lg bg-paper px-4 py-2.5 text-sm"
                                    >
                                        <span>{prize.label}</span>
                                        <span className="font-display font-bold text-gold">
                                            ×{prize.count}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    <div className="bg-spotlight shadow-lift rounded-2xl p-[2px]">
                        <div className="h-full rounded-[calc(1rem-2px)] bg-card p-7">
                            <p className="mb-3 inline-flex items-center gap-2 text-xs font-semibold tracking-widest text-violet uppercase">
                                <Car className="size-4" aria-hidden />
                                {t('prizes.grand_title')}
                            </p>
                            <p className="font-display text-xl font-bold">{t('prizes.grand_body')}</p>
                        </div>
                    </div>
                </div>

                <p className="mt-6 rounded-xl border border-border bg-card px-5 py-4 text-center text-sm text-mist">
                    {t('prizes.entry_rule')}
                </p>

                <div className="mt-8 flex flex-wrap justify-center gap-3">
                    <Button asChild size="lg" className="font-semibold">
                        <Link href={nomineesIndex(locale).url}>{t('prizes.cta')}</Link>
                    </Button>
                    <Button asChild size="lg" variant="outline">
                        <Link href={winners(locale).url}>{t('prizes.see_winners')}</Link>
                    </Button>
                </div>
            </section>
        </>
    );
}
