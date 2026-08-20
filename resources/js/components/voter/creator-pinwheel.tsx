import { Link } from '@inertiajs/react';
import { useInitials } from '@/hooks/use-initials';
import { useT } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { show as nomineeShow } from '@/routes/nominees';
import type { NomineeCardData } from '@/types';

const TILE_TONES = [
    'from-violet to-pink',
    'from-pink to-gold-fill',
    'from-gold-fill to-violet',
    'from-violet to-gold-fill',
    'from-pink to-violet',
    'from-gold-fill to-pink',
    'from-violet to-pink',
    'from-pink to-gold-fill',
];

/**
 * The hero centerpiece: eight rotated creator tiles fanned around a
 * pulsing "Vote" core, slowly turning (template pinwheel + play button).
 */
export function CreatorPinwheel({
    nominees,
    className,
    centerHref,
}: {
    nominees: NomineeCardData[];
    className?: string;
    centerHref: string;
}) {
    const { t, locale } = useT();
    const getInitials = useInitials();
    const tiles = nominees.slice(0, 8);
    const count = Math.max(tiles.length, 1);

    return (
        <div
            className={cn(
                'relative mx-auto aspect-square w-full max-w-[26rem]',
                className,
            )}
        >
            <div className="absolute inset-0 animate-spin-slow motion-reduce:animate-none">
                {tiles.map((nominee, index) => {
                    const angle = (360 / count) * index;

                    return (
                        <Link
                            key={nominee.id}
                            href={
                                nomineeShow({
                                    locale,
                                    nominee: nominee.share_slug,
                                }).url
                            }
                            aria-label={t('nominees.vote_for', {
                                name: nominee.display_name,
                            })}
                            className="absolute top-1/2 left-1/2 h-[38%] w-[24%] origin-[50%_0%] transition-transform hover:scale-105"
                            style={{
                                transform: `translate(-50%, 0) rotate(${angle}deg) translateY(14%)`,
                            }}
                        >
                            <span
                                className={cn(
                                    'flex size-full items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br shadow-[0_16px_40px_-16px_rgb(0_0_0/0.8)] ring-1 ring-white/20',
                                    TILE_TONES[index % TILE_TONES.length],
                                )}
                            >
                                {nominee.image_path ? (
                                    <img
                                        src={nominee.image_path}
                                        alt=""
                                        className="size-full object-cover"
                                    />
                                ) : (
                                    <span className="font-display text-lg font-bold text-white md:text-2xl">
                                        {getInitials(nominee.display_name)}
                                    </span>
                                )}
                            </span>
                        </Link>
                    );
                })}
            </div>

            {/* Pulsing core */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <span
                    aria-hidden
                    className="absolute inset-0 animate-pulse-ring rounded-full bg-brand motion-reduce:animate-none"
                />
                <Link
                    href={centerHref}
                    className="relative flex size-16 items-center justify-center rounded-full bg-brand font-display text-sm font-bold text-white ring-4 shadow-glow ring-night md:size-20 md:text-base"
                >
                    {t('common.vote')}
                </Link>
            </div>
        </div>
    );
}
