import { Head } from '@inertiajs/react';
import { Trophy } from 'lucide-react';
import { PageHeader } from '@/components/voter/page-header';
import { Reveal } from '@/components/voter/reveal';
import { useT } from '@/lib/i18n';
import { cn } from '@/lib/utils';

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

            <PageHeader
                badge={t('winners.eyebrow')}
                title={t('winners.title')}
                subtitle={t('winners.subtitle')}
            />

            <section className="mx-auto max-w-6xl px-4 pb-16 md:pb-24">
                {weeks.length === 0 ? (
                    <Reveal>
                        <div className="rounded-3xl border border-border/70 bg-white px-6 py-20 text-center shadow-lift">
                            <span className="mx-auto flex size-16 items-center justify-center rounded-full bg-brand text-white">
                                <Trophy className="size-7" aria-hidden />
                            </span>
                            <p className="mt-5 text-[17px] text-ink/70">
                                {t('winners.empty')}
                            </p>
                        </div>
                    </Reveal>
                ) : (
                    <div className="space-y-10">
                        {weeks.map((week, weekIndex) => (
                            <Reveal
                                key={week.week_key}
                                delay={weekIndex * 80}
                                as="section"
                            >
                                <h2 className="font-display text-2xl font-bold tracking-tight uppercase">
                                    {t('winners.week')}{' '}
                                    <span className="text-brand">
                                        {week.week_key}
                                    </span>
                                </h2>
                                <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                                    {week.winners.map((winner, index) => (
                                        <li
                                            key={index}
                                            className={cn(
                                                'flex items-center justify-between gap-3 rounded-xl bg-white px-5 py-4',
                                                index === 0 &&
                                                    'bg-brand text-white sm:col-span-2',
                                            )}
                                        >
                                            <span className="flex items-center gap-3">
                                                <span
                                                    className={cn(
                                                        'flex size-9 items-center justify-center rounded-full',
                                                        index === 0
                                                            ? 'bg-white/20'
                                                            : 'bg-paper-soft',
                                                    )}
                                                >
                                                    <Trophy
                                                        className={cn(
                                                            'size-4',
                                                            index === 0
                                                                ? 'text-gold-fill'
                                                                : 'text-gold',
                                                        )}
                                                        aria-hidden
                                                    />
                                                </span>
                                                <span className="font-semibold">
                                                    {winner.masked_name}
                                                </span>
                                            </span>
                                            <span
                                                className={cn(
                                                    'text-sm font-medium',
                                                    index === 0
                                                        ? 'text-white/85'
                                                        : 'text-ink/60',
                                                )}
                                            >
                                                {winner.prize_label}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            </Reveal>
                        ))}
                    </div>
                )}
            </section>
        </>
    );
}
