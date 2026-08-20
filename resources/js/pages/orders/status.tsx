import { Head, Link, router, usePoll } from '@inertiajs/react';
import {
    ArrowRight,
    CircleAlert,
    CircleCheck,
    Clock,
    Ticket,
} from 'lucide-react';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { NomineeAvatar } from '@/components/voter/nominee-avatar';
import { useT } from '@/lib/i18n';
import { checkout, leaderboard } from '@/routes';
import { show as nomineeShow } from '@/routes/nominees';
import { retry as ordersRetry } from '@/routes/orders';

type StatusProps = {
    rank: number | null;
    order: {
        reference: string;
        status:
            | 'CREATED'
            | 'PAYMENT_PENDING'
            | 'SUCCESS'
            | 'FAILED'
            | 'EXPIRED'
            | 'REFUNDED';
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

    const isPending =
        order.status === 'CREATED' || order.status === 'PAYMENT_PENDING';

    // Browser return is display-only; the page just watches the
    // server-confirmed order status until it turns terminal.
    const { stop } = usePoll(
        2500,
        { only: ['order', 'raffle', 'rank'] },
        { autoStart: isPending },
    );

    useEffect(() => {
        if (!isPending) {
            stop();
        }
    }, [isPending, stop]);

    const nomineeHref = nomineeShow({
        locale,
        nominee: order.nominee.share_slug,
    }).url;

    return (
        <>
            <Head
                title={t(
                    `status.${order.status === 'SUCCESS' ? 'success' : 'pending'}_title`,
                )}
            />

            <section className="relative min-h-[70vh] overflow-hidden stage py-14 md:py-20">
                <div className="relative mx-auto max-w-md animate-rise px-4">
                    <div className="rounded-2xl glass p-7 text-center md:p-9">
                        {isPending && (
                            <div className="space-y-4">
                                <Spinner className="mx-auto size-12 text-gold-fill" />
                                <h1 className="font-display text-3xl font-bold">
                                    {t('status.pending_title')}
                                </h1>
                                <p className="text-white/70">
                                    {t('status.pending_body')}
                                </p>
                            </div>
                        )}

                        {order.status === 'SUCCESS' && (
                            <div className="space-y-6">
                                <span className="mx-auto flex size-20 items-center justify-center rounded-full bg-brand">
                                    <CircleCheck
                                        className="size-10"
                                        aria-hidden
                                    />
                                </span>
                                <div>
                                    <h1 className="font-display text-display-md font-bold">
                                        {t('status.success_title')}
                                    </h1>
                                    <p className="mt-3 text-white/80">
                                        {t('status.success_body', {
                                            count: order.vote_qty,
                                            name: order.nominee.display_name,
                                        })}
                                    </p>
                                </div>

                                <div className="flex items-center justify-center gap-4 rounded-xl bg-night-soft px-5 py-4">
                                    <NomineeAvatar
                                        name={order.nominee.display_name}
                                        imagePath={order.nominee.image_path}
                                        className="size-14 text-lg"
                                    />
                                    <div className="text-left">
                                        <p className="font-display text-lg font-semibold">
                                            {order.nominee.display_name}
                                        </p>
                                        {rank != null && (
                                            <p className="text-sm text-gold-fill">
                                                {t('status.success_rank', {
                                                    name: order.nominee
                                                        .display_name,
                                                    rank,
                                                })}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {raffle?.entered && (
                                    <div className="rounded-xl bg-brand p-[2px]">
                                        <div className="rounded-[calc(0.75rem-2px)] bg-night px-5 py-4">
                                            <p className="flex items-center justify-center gap-2 font-semibold">
                                                <Ticket
                                                    className="size-5 text-gold-fill"
                                                    aria-hidden
                                                />
                                                {t('status.success_raffle')}
                                            </p>
                                            <p className="mt-1 text-sm text-white/70">
                                                {t('status.total_entries', {
                                                    count: raffle.total_entries,
                                                })}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                <div className="flex flex-col gap-3">
                                    <Button asChild size="lg">
                                        <Link
                                            href={
                                                checkout({
                                                    locale,
                                                    nominee:
                                                        order.nominee
                                                            .share_slug,
                                                }).url
                                            }
                                        >
                                            {t('status.vote_again')}
                                            <ArrowRight
                                                className="cta-arrow"
                                                aria-hidden
                                            />
                                        </Link>
                                    </Button>
                                    <Button asChild size="lg" variant="glass">
                                        <Link href={nomineeHref}>
                                            {t('nominees.share')}
                                        </Link>
                                    </Button>
                                    <Link
                                        href={leaderboard(locale).url}
                                        className="text-sm font-semibold text-white/70 hover:text-white"
                                    >
                                        {t('status.view_leaderboard')}
                                    </Link>
                                </div>
                            </div>
                        )}

                        {(order.status === 'FAILED' ||
                            order.status === 'EXPIRED') && (
                            <div className="space-y-6">
                                <span className="mx-auto flex size-20 items-center justify-center rounded-full bg-ember">
                                    <CircleAlert
                                        className="size-10"
                                        aria-hidden
                                    />
                                </span>
                                <div>
                                    <h1 className="font-display text-display-md font-bold">
                                        {t(
                                            order.status === 'FAILED'
                                                ? 'status.failed_title'
                                                : 'status.expired_title',
                                        )}
                                    </h1>
                                    <p className="mt-3 text-white/80">
                                        {t(
                                            order.status === 'FAILED'
                                                ? 'status.failed_body'
                                                : 'status.expired_body',
                                        )}
                                    </p>
                                </div>
                                <div className="flex items-center justify-center gap-4 rounded-xl bg-night-soft px-5 py-4">
                                    <NomineeAvatar
                                        name={order.nominee.display_name}
                                        imagePath={order.nominee.image_path}
                                        className="size-12 text-base"
                                    />
                                    <p className="text-left text-sm">
                                        <span className="block font-semibold">
                                            {order.nominee.display_name}
                                        </span>
                                        <span className="text-white/70">
                                            {order.vote_qty}{' '}
                                            {t('common.votes').toLowerCase()} ·{' '}
                                            {(
                                                order.amount_minor / 100
                                            ).toLocaleString()}{' '}
                                            {t('common.etb')}
                                        </span>
                                    </p>
                                </div>
                                <Button
                                    size="lg"
                                    className="w-full"
                                    onClick={() =>
                                        router.post(
                                            ordersRetry({
                                                locale,
                                                order: order.reference,
                                            }).url,
                                        )
                                    }
                                >
                                    {t('status.try_again')}
                                    <ArrowRight
                                        className="cta-arrow"
                                        aria-hidden
                                    />
                                </Button>
                            </div>
                        )}

                        {order.status === 'REFUNDED' && (
                            <div className="space-y-4">
                                <Clock
                                    className="mx-auto size-12 text-white/60"
                                    aria-hidden
                                />
                                <h1 className="font-display text-3xl font-bold">
                                    {t('status.refunded_title')}
                                </h1>
                                <p className="text-white/70">
                                    {t('status.refunded_body')}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </section>
        </>
    );
}
