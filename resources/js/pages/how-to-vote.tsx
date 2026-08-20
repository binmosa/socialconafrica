import { Head, Link, usePage } from '@inertiajs/react';
import {
    ArrowRight,
    CircleCheck,
    CreditCard,
    Search,
    UserCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/voter/page-header';
import { Reveal } from '@/components/voter/reveal';
import { useT } from '@/lib/i18n';
import { prizes } from '@/routes';
import { index as nomineesIndex } from '@/routes/nominees';
import type { SharedData } from '@/types';

export default function HowToVote() {
    const { t, locale } = useT();
    const { pricing } = usePage<SharedData>().props;
    const price = pricing.unit_etb;

    const steps = [
        {
            icon: Search,
            title: t('how_to_vote.step1_title'),
            body: t('how_to_vote.step1_body'),
        },
        {
            icon: UserCheck,
            title: t('how_to_vote.step2_title'),
            body: t('how_to_vote.step2_body'),
        },
        {
            icon: CreditCard,
            title: t('how_to_vote.step3_title', { price }),
            body: t('how_to_vote.step3_body'),
        },
    ];

    return (
        <>
            <Head title={t('how_to_vote.title')} />

            <PageHeader
                badge={t('how_to_vote.badge')}
                title={t('home.steps_title')}
                subtitle={t('how_to_vote.subtitle')}
            />

            <section className="mx-auto max-w-6xl px-4 pb-16 md:pb-24">
                <ol className="grid gap-5 md:grid-cols-3">
                    {steps.map((step, index) => {
                        const Icon = step.icon;

                        return (
                            <Reveal
                                key={step.title}
                                delay={index * 90}
                                as="li"
                                className="h-full"
                            >
                                <div className="flex h-full flex-col rounded-3xl border border-border/70 bg-white p-6 shadow-lift">
                                    <div className="flex items-center justify-between">
                                        <span className="flex size-11 items-center justify-center rounded-full bg-veil text-violet">
                                            <Icon
                                                className="size-5"
                                                aria-hidden
                                            />
                                        </span>
                                        <span className="text-[11px] font-bold tracking-[0.14em] text-ink/55 uppercase">
                                            {t('how_to_vote.step_label')}{' '}
                                            {String(index + 1).padStart(2, '0')}
                                        </span>
                                    </div>
                                    <h2 className="mt-5 font-display text-xl font-bold text-ink">
                                        {step.title}
                                    </h2>
                                    <p className="mt-2 text-[15px] leading-6 text-ink/65">
                                        {step.body}
                                    </p>
                                    <p className="mt-auto flex items-center gap-1.5 pt-5 text-xs font-semibold text-violet">
                                        <CircleCheck
                                            className="size-4"
                                            aria-hidden
                                        />
                                        {t('how_to_vote.required')}
                                    </p>
                                </div>
                            </Reveal>
                        );
                    })}
                </ol>

                <Reveal delay={200}>
                    <div className="mt-6 rounded-3xl border border-border/70 bg-white p-6 md:p-8">
                        <h2 className="font-display text-xl font-bold text-ink">
                            {t('how_to_vote.payment_title')}
                        </h2>
                        <p className="mt-2 max-w-3xl text-[15px] leading-7 text-ink/65">
                            {t('how_to_vote.payment_body', { price })}
                        </p>
                        <p className="mt-4 inline-flex rounded-full bg-veil px-3 py-1 text-xs font-semibold text-violet">
                            {t('how_to_vote.pricing_note', { price })}
                        </p>
                    </div>
                </Reveal>

                <Reveal delay={260} className="mt-8 flex flex-wrap gap-3">
                    <Button asChild size="lg" className="rounded-full">
                        <Link href={nomineesIndex(locale).url}>
                            {t('how_to_vote.cta')}
                            <ArrowRight className="cta-arrow" aria-hidden />
                        </Link>
                    </Button>
                    <Button
                        asChild
                        size="lg"
                        variant="outline"
                        className="rounded-full"
                    >
                        <Link href={prizes(locale).url}>
                            {t('how_to_vote.cta_secondary')}
                        </Link>
                    </Button>
                </Reveal>
            </section>
        </>
    );
}
