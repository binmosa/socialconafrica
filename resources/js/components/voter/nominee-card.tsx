import { Link } from '@inertiajs/react';
import { show as nomineeShow } from '@/routes/nominees';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { NomineeAvatar } from '@/components/voter/nominee-avatar';
import { useT } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import type { NomineeCardData } from '@/types';

export function NomineeCard({ nominee, index = 0 }: { nominee: NomineeCardData; index?: number }) {
    const { t, locale } = useT();
    const href = nomineeShow({ locale, nominee: nominee.share_slug }).url;
    void index;

    return (
        <article className="group shadow-lift relative flex flex-col items-center gap-3 rounded-2xl border border-border/60 bg-card p-5 text-center transition-all hover:-translate-y-1 hover:border-gold-fill/60">
            {nominee.rank != null && (
                <span
                    className={cn(
                        'absolute top-3 left-3 flex size-7 items-center justify-center rounded-full font-display text-xs font-bold tabular-nums',
                        nominee.rank <= 3 ? 'bg-spotlight text-white' : 'bg-veil text-violet',
                    )}
                    aria-label={`${t('nominees.rank')} ${nominee.rank}`}
                >
                    #{nominee.rank}
                </span>
            )}
            <NomineeAvatar
                name={nominee.display_name}
                imagePath={nominee.image_path}
                className="size-20 text-xl"
            />
            <div className="min-w-0">
                <h3 className="truncate font-display text-base font-bold">
                    <Link href={href} className="after:absolute after:inset-0">
                        {nominee.display_name}
                    </Link>
                </h3>
                <p className="truncate text-sm text-mist">@{nominee.handle}</p>
                {nominee.approx_votes ? (
                    <p className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-gold-fill/15 px-2.5 py-0.5 text-xs font-semibold text-gold-soft">
                        {nominee.approx_votes} {t('nominees.votes')}
                    </p>
                ) : null}
            </div>
            <div className="flex flex-wrap justify-center gap-1.5">
                {nominee.categories.map((category) => (
                    <Badge key={category.slug} variant="secondary" className="text-xs text-mist">
                        {category.name}
                    </Badge>
                ))}
            </div>
            <Button
                size="sm"
                className="pointer-events-none mt-1 w-full font-semibold"
                tabIndex={-1}
                aria-hidden
            >
                {t('common.vote')}
            </Button>
        </article>
    );
}
