import { Head, Link, router, usePage } from '@inertiajs/react';
import { ArrowRight, Ticket } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/voter/page-header';
import { Reveal } from '@/components/voter/reveal';
import { useT } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { logout } from '@/routes';
import { index as nomineesIndex, show as nomineeShow } from '@/routes/nominees';
import type { SharedData } from '@/types';

type MeProps = {
    orders: {
        reference: string;
        nominee: { display_name: string; share_slug: string };
        vote_qty: number;
        amount_minor: number;
        status: string;
        created_at: string | null;
    }[];
    activeDrawEntries: number;
    authProviders: string[];
};

const STATUS_STYLES: Record<string, string> = {
    SUCCESS: 'bg-emerald-50 text-emerald-700',
    FAILED: 'bg-ember/10 text-ember',
    REFUNDED: 'bg-paper-soft text-ink/60',
};

export default function Me({
    orders,
    activeDrawEntries,
    authProviders,
}: MeProps) {
    const { t, locale } = useT();
    const { auth } = usePage<SharedData>().props;

    return (
        <>
            <Head title={t('me.title')} />

            <PageHeader
                badge={t('me.eyebrow')}
                title={auth.voter?.display_name ?? t('me.title')}
                subtitle={
                    <>
                        {auth.voter?.phone_masked
                            ? `${auth.voter.phone_masked} · `
                            : ''}
                        {authProviders.map((provider) => provider).join(' · ')}
                    </>
                }
            >
                <div className="flex flex-wrap items-center gap-3">
                    <div className="inline-flex items-center gap-3 rounded-full border border-border/70 bg-white px-5 py-2.5 shadow-sm">
                        <Ticket className="size-5 text-gold" aria-hidden />
                        <span className="font-display text-2xl font-bold text-violet tabular-nums">
                            {activeDrawEntries}
                        </span>
                        <span className="text-sm font-semibold text-ink/70">
                            {t('me.draw_entries')}
                        </span>
                    </div>
                    <Button
                        variant="outline"
                        className="rounded-full"
                        onClick={() => router.post(logout(locale).url)}
                    >
                        {t('nav.logout')}
                    </Button>
                </div>
            </PageHeader>

            <section className="mx-auto max-w-6xl px-4 pb-16 md:pb-24">
                <h2 className="font-display text-2xl font-bold">
                    {t('me.orders')}
                </h2>
                {orders.length === 0 ? (
                    <Reveal>
                        <div className="mt-5 rounded-2xl bg-white px-6 py-14 text-center">
                            <p className="text-ink/70">{t('me.no_orders')}</p>
                            <Button asChild size="lg" className="mt-6">
                                <Link href={nomineesIndex(locale).url}>
                                    {t('hero.cta_vote')}
                                    <ArrowRight
                                        className="cta-arrow"
                                        aria-hidden
                                    />
                                </Link>
                            </Button>
                        </div>
                    </Reveal>
                ) : (
                    <ul className="mt-5 space-y-3">
                        {orders.map((order, index) => (
                            <Reveal
                                key={order.reference}
                                delay={Math.min(index, 6) * 50}
                                as="li"
                            >
                                <div className="flex items-center justify-between gap-4 rounded-xl bg-white px-5 py-4">
                                    <div className="min-w-0">
                                        <Link
                                            href={
                                                nomineeShow({
                                                    locale,
                                                    nominee:
                                                        order.nominee
                                                            .share_slug,
                                                }).url
                                            }
                                            className="font-display text-lg font-semibold hover:text-pink"
                                        >
                                            {order.nominee.display_name}
                                        </Link>
                                        <p className="text-sm text-ink/60">
                                            {order.vote_qty}{' '}
                                            {t('common.votes').toLowerCase()} ·{' '}
                                            {(
                                                order.amount_minor / 100
                                            ).toLocaleString()}{' '}
                                            {t('common.etb')}
                                            {order.created_at
                                                ? ` · ${new Date(order.created_at).toLocaleDateString()}`
                                                : ''}
                                        </p>
                                    </div>
                                    <span
                                        className={cn(
                                            'rounded-full px-3 py-1 text-xs font-bold',
                                            STATUS_STYLES[order.status] ??
                                                'bg-paper-soft text-ink/60',
                                        )}
                                    >
                                        {order.status}
                                    </span>
                                </div>
                            </Reveal>
                        ))}
                    </ul>
                )}
            </section>
        </>
    );
}
