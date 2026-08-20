import { Link, usePage } from '@inertiajs/react';
import { CircleUserRound, Gift, House, Trophy, Vote } from 'lucide-react';
import { useT } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { home, leaderboard, login, me, prizes } from '@/routes';
import { index as nomineesIndex } from '@/routes/nominees';
import type { SharedData } from '@/types';

/**
 * Mobile tab bar on the night ground with a raised gradient Vote action.
 */
export function BottomNav() {
    const { t, locale } = useT();
    const { url, props } = usePage<SharedData>();

    const left = [
        {
            href: home(locale).url,
            label: t('nav.home'),
            icon: House,
            exact: true,
        },
        {
            href: leaderboard(locale).url,
            label: t('nav.leaderboard'),
            icon: Trophy,
            exact: false,
        },
    ];
    const right = [
        {
            href: prizes(locale).url,
            label: t('nav.prizes'),
            icon: Gift,
            exact: false,
        },
        {
            href: props.auth.voter ? me(locale).url : login(locale).url,
            label: props.auth.voter ? t('nav.my_votes') : t('nav.login'),
            icon: CircleUserRound,
            exact: false,
        },
    ];

    const isActive = (href: string, exact: boolean) => {
        const path = url.split('?')[0];

        return exact ? path === href : path.startsWith(href);
    };

    const renderItem = (item: (typeof left)[number]) => {
        const active = isActive(item.href, item.exact);
        const Icon = item.icon;

        return (
            <Link
                key={item.href}
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                    'flex min-w-14 flex-col items-center gap-0.5 rounded-lg px-2 py-1.5 text-[11px] font-semibold',
                    active ? 'text-white' : 'text-white/55',
                )}
            >
                <Icon
                    className={cn('size-5', active && 'text-gold-fill')}
                    aria-hidden
                />
                {item.label}
            </Link>
        );
    };

    return (
        <nav
            aria-label="Primary"
            className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 stage-flat md:hidden"
        >
            <div className="mx-auto flex max-w-md items-end justify-around pt-1.5 pb-[max(0.375rem,env(safe-area-inset-bottom))]">
                {left.map(renderItem)}

                <Link
                    href={nomineesIndex(locale).url}
                    aria-label={t('common.vote')}
                    className="-mt-7 flex flex-col items-center gap-0.5"
                >
                    <span className="flex size-14 items-center justify-center rounded-full bg-brand text-white ring-4 shadow-glow ring-night">
                        <Vote className="size-6" aria-hidden />
                    </span>
                    <span className="text-[11px] font-bold">
                        {t('common.vote')}
                    </span>
                </Link>

                {right.map(renderItem)}
            </div>
        </nav>
    );
}
