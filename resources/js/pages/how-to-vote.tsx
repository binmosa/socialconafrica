import { Head, Link } from '@inertiajs/react';
import { CreditCard, Search, UserCheck } from 'lucide-react';
import { index as nomineesIndex } from '@/routes/nominees';
import { Button } from '@/components/ui/button';
import { useT } from '@/lib/i18n';

export default function HowToVote() {
    const { t, locale } = useT();

    const steps = [
        { icon: Search, title: t('how_to_vote.step1_title'), body: t('how_to_vote.step1_body') },
        { icon: UserCheck, title: t('how_to_vote.step2_title'), body: t('how_to_vote.step2_body') },
        { icon: CreditCard, title: t('how_to_vote.step3_title'), body: t('how_to_vote.step3_body') },
    ];

    return (
        <>
            <Head title={t('how_to_vote.title')} />

            <section className="mx-auto max-w-3xl px-4 py-12">
                <header className="mb-10 text-center">
                    <h1 className="font-display text-3xl font-extrabold tracking-tight md:text-4xl">
                        {t('how_to_vote.title')}
                    </h1>
                    <p className="mx-auto mt-3 max-w-xl text-sm text-mist md:text-base">
                        {t('how_to_vote.subtitle')}
                    </p>
                </header>

                <ol className="space-y-4">
                    {steps.map((step, index) => {
                        const Icon = step.icon;
                        return (
                            <li
                                key={step.title}
                                className="flex gap-4 rounded-xl border border-border bg-card p-6"
                            >
                                <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-spotlight text-white">
                                    <Icon className="size-5" aria-hidden />
                                </span>
                                <div>
                                    <p className="text-xs font-bold text-mist">
                                        {String(index + 1).padStart(2, '0')}
                                    </p>
                                    <h2 className="font-display text-lg font-bold">{step.title}</h2>
                                    <p className="mt-1 text-sm text-mist">{step.body}</p>
                                </div>
                            </li>
                        );
                    })}
                </ol>

                <p className="mt-6 rounded-xl border border-gold-fill/30 bg-gold-fill/10 px-5 py-4 text-center text-sm text-gold-soft">
                    {t('how_to_vote.pricing_note', { price: 10 })}
                </p>

                <div className="mt-8 text-center">
                    <Button asChild size="lg" className="font-semibold">
                        <Link href={nomineesIndex(locale).url}>{t('how_to_vote.cta')}</Link>
                    </Button>
                </div>
            </section>
        </>
    );
}
