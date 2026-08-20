import { Head, Link, usePage } from '@inertiajs/react';
import { useEffect } from 'react';
import { checkout } from '@/routes';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { NomineeAvatar } from '@/components/voter/nominee-avatar';
import { ShareSheet } from '@/components/voter/share-sheet';
import { track } from '@/lib/analytics';
import { useT } from '@/lib/i18n';
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

    return (
        <>
            <Head title={nominee.display_name} />

            <section className="mx-auto max-w-3xl px-4 py-12">
                <div className="flex flex-col items-center gap-5 text-center">
                    <NomineeAvatar
                        name={nominee.display_name}
                        imagePath={nominee.image_path}
                        className="size-28 text-3xl"
                    />
                    <div>
                        <h1 className="font-display text-3xl font-extrabold tracking-tight md:text-4xl">
                            {nominee.display_name}
                        </h1>
                        <p className="mt-1 text-mist">
                            @{nominee.handle}
                            {nominee.city ? ` · ${nominee.city}` : ''}
                        </p>
                        {nominee.rank != null && (
                            <p className="mt-2 inline-flex items-center gap-2 rounded-full border border-gold-fill/40 bg-gold-fill/10 px-4 py-1.5 text-sm font-semibold text-gold-soft">
                                {t('nominees.rank')} #{nominee.rank}
                                <span aria-hidden>·</span>
                                {nominee.approx_votes} {t('nominees.votes')}
                            </p>
                        )}
                    </div>

                    <div className="flex flex-wrap justify-center gap-2">
                        <span className="text-xs font-semibold tracking-widest text-mist uppercase">
                            {t('nominees.in_categories')}
                        </span>
                        {nominee.categories.map((category) => (
                            <Badge key={category.slug} variant="secondary" className="text-gold-soft">
                                {category.name}
                            </Badge>
                        ))}
                    </div>

                    {nominee.bio && <p className="max-w-xl text-sm text-mist">{nominee.bio}</p>}

                    <div className="mt-2 flex w-full max-w-sm flex-col gap-3">
                        {votingWindow.is_open ? (
                            <Button size="lg" className="w-full font-semibold" asChild>
                                <Link
                                    href={checkout({ locale, nominee: nominee.share_slug }).url}
                                    onClick={() => track('vote_clicked', { nominee_id: nominee.id })}
                                >
                                    {t('nominees.vote_for', { name: nominee.display_name })}
                                </Link>
                            </Button>
                        ) : (
                            <Button size="lg" className="w-full font-semibold" disabled>
                                {t('hero.opens_soon')}
                            </Button>
                        )}
                        <ShareSheet
                            shareUrl={shareUrl}
                            text={t('nominees.share_text', { name: nominee.display_name })}
                            nomineeId={nominee.id}
                        />
                    </div>
                </div>
            </section>
        </>
    );
}
