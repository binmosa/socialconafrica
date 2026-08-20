import { Link, usePage } from '@inertiajs/react';
import { coverFor } from '@/components/voter/nominee-card';
import { useInitials } from '@/hooks/use-initials';
import { useT } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { checkout } from '@/routes';
import type { NomineeCardData, SharedData } from '@/types';

/**
 * The hero centerpiece: mini creator cards (name, category, rank, vote
 * price) orbiting a pulsing "Vote" core. The orbit turns slowly while each
 * card counter-rotates, so the cards stay upright and readable; tapping a
 * card goes straight to that creator's checkout.
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
    const { pricing } = usePage<SharedData>().props;
    const getInitials = useInitials();
    const cards = nominees.slice(0, 6);
    const count = Math.max(cards.length, 1);

    return (
        <div
            className={cn(
                'relative mx-auto aspect-square w-full max-w-[30rem]',
                className,
            )}
        >
            {/* Orbit guide */}
            <div
                aria-hidden
                className="absolute inset-[9%] rounded-full border border-dashed border-white/15"
            />

            <div className="absolute inset-0 animate-spin-slow motion-reduce:animate-none">
                {cards.map((nominee, index) => {
                    const angle = (360 / count) * index;
                    const category = nominee.categories[0];

                    return (
                        <div
                            key={nominee.id}
                            className="absolute inset-0"
                            style={{ transform: `rotate(${angle}deg)` }}
                        >
                            <div className="absolute top-[1%] left-1/2 -translate-x-1/2">
                                <div
                                    style={{
                                        transform: `rotate(${-angle}deg)`,
                                    }}
                                >
                                    <div className="animate-spin-slow-reverse motion-reduce:animate-none">
                                        <Link
                                            href={
                                                checkout({
                                                    locale,
                                                    nominee: nominee.share_slug,
                                                }).url
                                            }
                                            aria-label={t('nominees.vote_for', {
                                                name: nominee.display_name,
                                            })}
                                            className="block w-[6.75rem] overflow-hidden rounded-xl bg-white text-ink shadow-[0_18px_40px_-18px_rgb(0_0_0/0.7)] ring-1 ring-white/30 transition-transform hover:-translate-y-1 hover:scale-[1.04] sm:w-[9rem]"
                                        >
                                            <div
                                                className={cn(
                                                    'relative h-9 bg-gradient-to-br sm:h-10',
                                                    coverFor(nominee.id),
                                                )}
                                            >
                                                {nominee.rank != null && (
                                                    <span className="absolute top-1.5 left-1.5 rounded-full bg-white/95 px-1.5 py-0.5 text-[9px] font-bold text-ink">
                                                        #{nominee.rank}
                                                    </span>
                                                )}
                                                <span className="absolute right-2 -bottom-4 flex size-8 items-center justify-center overflow-hidden rounded-full bg-white ring-2 ring-white">
                                                    {nominee.image_path ? (
                                                        <img
                                                            src={
                                                                nominee.image_path
                                                            }
                                                            alt=""
                                                            className="size-full object-cover"
                                                        />
                                                    ) : (
                                                        <span className="flex size-full items-center justify-center bg-brand font-display text-[11px] font-bold text-white">
                                                            {getInitials(
                                                                nominee.display_name,
                                                            )}
                                                        </span>
                                                    )}
                                                </span>
                                            </div>
                                            <div className="px-2.5 pt-2 pb-2.5 text-left">
                                                <p className="truncate pr-7 text-[11px] leading-4 font-bold sm:text-xs">
                                                    {nominee.display_name}
                                                </p>
                                                <p className="truncate text-[10px] leading-4 text-ink/60">
                                                    {category?.name ??
                                                        `@${nominee.handle}`}
                                                </p>
                                                <span className="mt-2 block rounded-full bg-brand py-1 text-center text-[10px] font-bold text-white">
                                                    {t('nominees.vote_price', {
                                                        price: pricing.unit_etb,
                                                    })}
                                                </span>
                                            </div>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
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
                    className="relative flex size-16 flex-col items-center justify-center rounded-full bg-brand font-display text-sm leading-none font-bold text-white ring-4 shadow-glow ring-night md:size-20 md:text-base"
                >
                    {t('common.vote')}
                    <span className="mt-0.5 text-[9px] font-semibold tracking-wide uppercase opacity-80">
                        {pricing.unit_etb} {t('common.etb')}
                    </span>
                </Link>
            </div>
        </div>
    );
}
