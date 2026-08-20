import { Head } from '@inertiajs/react';
import { Trophy } from 'lucide-react';
import { useT } from '@/lib/i18n';

type PublishedWinner = {
    masked_name: string;
    prize_label: string;
};

type WinnersProps = {
    weeks?: { week_key: string; winners: PublishedWinner[] }[];
};

export default function Winners({ weeks = [] }: WinnersProps) {
    const { t } = useT();

    return (
        <>
            <Head title={t('winners.title')} />

            <section className="mx-auto max-w-3xl px-4 py-12">
                <header className="mb-10 text-center">
                    <h1 className="font-display text-3xl font-extrabold tracking-tight md:text-4xl">
                        {t('winners.title')}
                    </h1>
                    <p className="mt-3 text-sm text-mist md:text-base">{t('winners.subtitle')}</p>
                </header>

                {weeks.length === 0 ? (
                    <div className="rounded-2xl border border-border bg-card px-6 py-16 text-center">
                        <Trophy className="mx-auto mb-4 size-10 text-gold" aria-hidden />
                        <p className="text-sm text-mist">{t('winners.empty')}</p>
                    </div>
                ) : (
                    <div className="space-y-8">
                        {weeks.map((week) => (
                            <section key={week.week_key}>
                                <h2 className="mb-3 font-display text-lg font-bold text-gold">
                                    {t('winners.week')} {week.week_key}
                                </h2>
                                <ul className="space-y-2">
                                    {week.winners.map((winner, index) => (
                                        <li
                                            key={index}
                                            className="flex items-center justify-between rounded-lg border border-border bg-card px-4 py-3 text-sm"
                                        >
                                            <span>{winner.masked_name}</span>
                                            <span className="text-mist">{winner.prize_label}</span>
                                        </li>
                                    ))}
                                </ul>
                            </section>
                        ))}
                    </div>
                )}
            </section>
        </>
    );
}
