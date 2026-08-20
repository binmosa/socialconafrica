import { Head, Link, router, usePoll } from '@inertiajs/react';
import { CircleAlert, CircleCheck, Clock, Ticket } from 'lucide-react';
import { useEffect } from 'react';
import { checkout, leaderboard } from '@/routes';
import { show as nomineeShow } from '@/routes/nominees';
import { retry as ordersRetry } from '@/routes/orders';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { NomineeAvatar } from '@/components/voter/nominee-avatar';
import { useT } from '@/lib/i18n';

type StatusProps = {
    rank: number | null;
    order: {
        reference: string;
        status: 'CREATED' | 'PAYMENT_PENDING' | 'SUCCESS' | 'FAILED' | 'EXPIRED' | 'REFUNDED';
        vote_qty: number;
        amount_minor: number;
        nominee: {
            display_name: string;
            share_slug: string;
            image_path: string | null;
        };
    };
    raffle: { entered: boolean; total_entries: number } | null;
};

export default function OrderStatus({ order, raffle, rank }: StatusProps) {
    const { t, locale } = useT();

    const isPending = order.status === 'CREATED' || order.status === 'PAYMENT_PENDING';

    // Browser return is display-only; the page just watches the
    // server-confirmed order status until it turns terminal.
    const { stop } = usePoll(2500, { only: ['order', 'raffle', 'rank'] }, { autoStart: isPending });

    useEffect(() => {
        if (!isPending) {
            stop();
        }
    }, [isPending, stop]);

    const nomineeHref = nomineeShow({ locale, nominee: order.nominee.share_slug }).url;

    return (
        <>
            <Head title={t(`status.${order.status === 'SUCCESS' ? 'success' : 'pending'}_title`)} />

            <section className="mx-auto max-w-md px-4 py-14 text-center">
                {isPending && (
                    <div className="space-y-4">
                        <Spinner className="mx-auto size-10 text-gold" />
                        <h1 className="font-display text-2xl font-extrabold">
                            {t('status.pending_title')}
                        </h1>
                        <p className="text-sm text-mist">{t('status.pending_body')}</p>
                    </div>
                )}

                {order.status === 'SUCCESS' && (
                    <div className="space-y-5">
                        <CircleCheck className="mx-auto size-14 text-emerald-600" aria-hidden />
                        <h1 className="font-display text-3xl font-extrabold">
                            {t('status.success_title')}
                        </h1>
                        <div className="flex items-center justify-center gap-3">
                            <NomineeAvatar
                                name={order.nominee.display_name}
                                imagePath={order.nominee.image_path}
                                className="size-12 text-base"
                            />
                            <p className="text-left text-sm text-mist">
                                {t('status.success_body', {
                                    count: order.vote_qty,
                                    name: order.nominee.display_name,
                                })}
                            </p>
                        </div>

                        {rank != null && (
                            <p className="text-sm font-semibold text-gold-soft">
                                {t('status.success_rank', {
                                    name: order.nominee.display_name,
                                    rank,
                                })}
                            </p>
                        )}

                        {raffle?.entered && (
                            <div className="rounded-xl border border-gold-fill/40 bg-gold-fill/10 px-5 py-4">
                                <p className="flex items-center justify-center gap-2 text-sm font-semibold text-gold-soft">
                                    <Ticket className="size-4" aria-hidden />
                                    {t('status.success_raffle')}
                                </p>
                                <p className="mt-1 text-xs text-mist">
                                    {t('status.total_entries', { count: raffle.total_entries })}
                                </p>
                            </div>
                        )}

                        <div className="flex flex-col gap-2.5">
                            <Button asChild size="lg" className="font-semibold">
                                <Link href={checkout({ locale, nominee: order.nominee.share_slug }).url}>
                                    {t('status.vote_again')}
                                </Link>
                            </Button>
                            <Button asChild size="lg" variant="outline">
                                <Link href={nomineeHref}>{t('nominees.share')}</Link>
                            </Button>
                            <Button asChild size="lg" variant="ghost" className="text-mist">
                                <Link href={leaderboard(locale).url}>
                                    {t('status.view_leaderboard')}
                                </Link>
                            </Button>
                        </div>
                    </div>
                )}

                {(order.status === 'FAILED' || order.status === 'EXPIRED') && (
                    <div className="space-y-5">
                        <CircleAlert className="mx-auto size-14 text-ember" aria-hidden />
                        <h1 className="font-display text-3xl font-extrabold">
                            {t(order.status === 'FAILED' ? 'status.failed_title' : 'status.expired_title')}
                        </h1>
                        <p className="text-sm text-mist">
                            {t(order.status === 'FAILED' ? 'status.failed_body' : 'status.expired_body')}
                        </p>
                        <Button
                            size="lg"
                            className="w-full font-semibold"
                            onClick={() =>
                                router.post(ordersRetry({ locale, order: order.reference }).url)
                            }
                        >
                            {t('status.try_again')}
                        </Button>
                    </div>
                )}

                {order.status === 'REFUNDED' && (
                    <div className="space-y-4">
                        <Clock className="mx-auto size-12 text-mist" aria-hidden />
                        <h1 className="font-display text-2xl font-extrabold">
                            {t('status.refunded_title')}
                        </h1>
                        <p className="text-sm text-mist">{t('status.refunded_body')}</p>
                    </div>
                )}
            </section>
        </>
    );
}
