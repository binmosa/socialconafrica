import { Head, Link, router, usePage } from '@inertiajs/react';
import { Ticket } from 'lucide-react';
import { logout } from '@/routes';
import { index as nomineesIndex, show as nomineeShow } from '@/routes/nominees';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useT } from '@/lib/i18n';
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
    SUCCESS: 'text-emerald-600',
    FAILED: 'text-ember',
    REFUNDED: 'text-mist',
};

export default function Me({ orders, activeDrawEntries, authProviders }: MeProps) {
    const { t, locale } = useT();
    const { auth } = usePage<SharedData>().props;

    return (
        <>
            <Head title={t('me.title')} />

            <section className="mx-auto max-w-3xl px-4 py-12">
                <header className="mb-8 flex items-start justify-between gap-4">
                    <div>
                        <h1 className="font-display text-3xl font-extrabold tracking-tight">
                            {t('me.title')}
                        </h1>
                        <p className="mt-1 text-mist">
                            {auth.voter?.display_name}
                            {auth.voter?.phone_masked ? ` · ${auth.voter.phone_masked}` : ''}
                        </p>
                        <div className="mt-2 flex gap-1.5">
                            {authProviders.map((provider) => (
                                <Badge key={provider} variant="secondary" className="capitalize">
                                    {provider}
                                </Badge>
                            ))}
                        </div>
                    </div>
                    <Button
                        variant="outline"
                        onClick={() => router.post(logout(locale).url)}
                    >
                        {t('nav.logout')}
                    </Button>
                </header>

                <div className="mb-8 flex items-center gap-3 rounded-xl border border-gold-fill/30 bg-card px-5 py-4">
                    <Ticket className="size-6 text-gold" aria-hidden />
                    <p className="text-sm">
                        <span className="font-display text-xl font-bold text-gold">
                            {activeDrawEntries}
                        </span>{' '}
                        <span className="text-mist">{t('me.draw_entries')}</span>
                    </p>
                </div>

                <h2 className="mb-3 font-display text-lg font-bold">{t('me.orders')}</h2>
                {orders.length === 0 ? (
                    <div className="rounded-xl border border-border bg-card px-6 py-10 text-center">
                        <p className="mb-4 text-sm text-mist">{t('me.no_orders')}</p>
                        <Button asChild className="font-semibold">
                            <Link href={nomineesIndex(locale).url}>{t('hero.cta_vote')}</Link>
                        </Button>
                    </div>
                ) : (
                    <ul className="space-y-2">
                        {orders.map((order) => (
                            <li
                                key={order.reference}
                                className="flex items-center justify-between gap-3 rounded-lg border border-border bg-card px-4 py-3 text-sm"
                            >
                                <div className="min-w-0">
                                    <Link
                                        href={nomineeShow({ locale, nominee: order.nominee.share_slug }).url}
                                        className="font-medium hover:text-gold-soft"
                                    >
                                        {order.nominee.display_name}
                                    </Link>
                                    <p className="text-xs text-mist">
                                        {order.vote_qty} {t('common.votes').toLowerCase()} ·{' '}
                                        {(order.amount_minor / 100).toLocaleString()} {t('common.etb')}
                                    </p>
                                </div>
                                <span
                                    className={`text-xs font-semibold ${STATUS_STYLES[order.status] ?? 'text-mist'}`}
                                >
                                    {order.status}
                                </span>
                            </li>
                        ))}
                    </ul>
                )}
            </section>
        </>
    );
}
