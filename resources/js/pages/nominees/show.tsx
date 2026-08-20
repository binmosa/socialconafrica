import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowRight, MapPin } from 'lucide-react';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { NomineeAvatar } from '@/components/voter/nominee-avatar';
import { PinwheelGlyph } from '@/components/voter/pinwheel-glyph';
import { ShareSheet } from '@/components/voter/share-sheet';
import { track } from '@/lib/analytics';
import { useT } from '@/lib/i18n';
import { checkout, leaderboard } from '@/routes';
import type { NomineeCardData, SharedData } from '@/types';

type NomineeShowProps = {
    nominee: NomineeCardData & {
        bio: string | null;
        social_profile_url: string | null;
        rank: number | null;
        approx_votes: string;
    };
};

export default function NomineeShow({ nominee }: NomineeShowProps) {
    const { t, locale } = useT();
    const { votingWindow } = usePage<SharedData>().props;

    useEffect(() => {
        track('nominee_opened', { nominee_id: nominee.id });
    }, [nominee.id]);

    const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
    const qty =
        typeof window !== 'undefined'
            ? new URLSearchParams(window.location.search).get('qty')
            : null;
    const checkoutHref = checkout(
        { locale, nominee: nominee.share_slug },
        { query: qty ? { qty } : {} },
    ).url;

    return (
        <>
            <Head title={nominee.display_name} />

            {/* Stage banner with the creator as the headliner */}
            <section className="relative overflow-hidden stage">
                <div className="relative mx-auto grid max-w-6xl animate-rise items-center gap-10 px-4 pt-12 pb-14 md:grid-cols-[auto_1fr_auto] md:pt-16 md:pb-20">
                    <NomineeAvatar
                        name={nominee.display_name}
                        imagePath={nominee.image_path}
                        className="size-36 text-4xl md:size-44 md:text-5xl"
                    />

                    <div className="text-center md:text-left">
                        <p className="inline-flex items-center gap-2 text-[13px] font-semibold tracking-[0.08em] uppercase">
                            <PinwheelGlyph className="size-[18px] text-gold-fill" />
                            {nominee.categories
                                .map((category) => category.name)
                                .join(' · ') || t('nominees.title')}
                        </p>
                        <h1 className="mt-3 font-display text-display-lg font-bold">
                            {nominee.display_name}
                        </h1>
                        <p className="mt-2 flex flex-wrap items-center justify-center gap-x-3 text-white/70 md:justify-start">
                            <span>@{nominee.handle}</span>
                            {nominee.city && (
                                <span className="inline-flex items-center gap-1">
                                    <MapPin className="size-4" aria-hidden />
                                    {nominee.city}
                                </span>
                            )}
                        </p>
                        {nominee.bio && (
                            <p className="mx-auto mt-5 max-w-xl text-[17px] leading-7 text-white/80 md:mx-0">
                                {nominee.bio}
                            </p>
                        )}
                    </div>

                    {nominee.rank != null && (
                        <Link
                            href={leaderboard(locale).url}
                            className="rounded-lg border border-white/10 bg-night-soft px-8 py-6 text-center transition-colors hover:border-white/30"
                        >
                            <p className="text-sm font-bold tracking-[0.14em] uppercase">
                                {t('nominees.rank')}
                            </p>
                            <p className="mt-1 font-display text-6xl font-bold text-gold-fill tabular-nums">
                                #{nominee.rank}
                            </p>
                            <p className="mt-1 text-sm text-white/70">
                                {nominee.approx_votes} {t('nominees.votes')}
                            </p>
                        </Link>
                    )}
                </div>
            </section>

            <section className="mx-auto max-w-6xl px-4 py-12 md:py-16">
                <div className="mx-auto max-w-xl rounded-2xl bg-white p-6 shadow-lift md:p-8">
                    <p className="text-center text-[13px] font-semibold tracking-[0.08em] text-violet uppercase">
                        {t('common.vote')}
                    </p>
                    <h2 className="mt-2 text-center font-display text-2xl font-bold md:text-3xl">
                        {t('nominees.vote_cta', { name: nominee.display_name })}
                    </h2>
                    <p className="mt-2 text-center text-sm text-ink/60">
                        {t('checkout.one_nominee_note')}
                    </p>

                    <div className="mt-7 flex flex-col gap-3">
                        {votingWindow.is_open ? (
                            <Button size="xl" asChild>
                                <Link
                                    href={checkoutHref}
                                    onClick={() =>
                                        track('vote_clicked', {
                                            nominee_id: nominee.id,
                                        })
                                    }
                                >
                                    {t('nominees.vote_for', {
                                        name: nominee.display_name,
                                    })}
                                    <ArrowRight
                                        className="cta-arrow"
                                        aria-hidden
                                    />
                                </Link>
                            </Button>
                        ) : (
                            <Button size="xl" disabled>
                                {t('hero.opens_soon')}
                            </Button>
                        )}
                        <ShareSheet
                            shareUrl={shareUrl}
                            text={t('nominees.share_text', {
                                name: nominee.display_name,
                            })}
                            nomineeId={nominee.id}
                        />
                    </div>
                </div>
            </section>
        </>
    );
}
