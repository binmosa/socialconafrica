import { Link, usePage } from '@inertiajs/react';
import { CircleUserRound } from 'lucide-react';
import { home, howToVote, leaderboard, login, me, prizes, winners } from '@/routes';
import { index as nomineesIndex } from '@/routes/nominees';
import { Button } from '@/components/ui/button';
import { LocaleToggle } from '@/components/voter/locale-toggle';
import { useT } from '@/lib/i18n';
import type { SharedData } from '@/types';

export function SiteHeader() {
    const { t, locale } = useT();
    const { auth } = usePage<SharedData>().props;

    const links = [
        { href: nomineesIndex(locale).url, label: t('nav.nominees') },
        { href: leaderboard(locale).url, label: t('nav.leaderboard') },
        { href: prizes(locale).url, label: t('nav.prizes') },
        { href: winners(locale).url, label: t('nav.winners') },
        { href: howToVote(locale).url, label: t('nav.how_to_vote') },
    ];

    return (
        <header className="sticky top-0 z-40 border-b border-border/60 bg-paper/80 backdrop-blur-md">
            <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
                <Link href={home(locale).url} className="flex items-baseline gap-1.5">
                    <span className="font-display text-lg font-bold tracking-tight">
                        SocialCon
                    </span>
                    <span className="text-spotlight font-display text-lg font-extrabold">
                        ACE
                    </span>
                    <span className="ml-2 hidden text-[11px] font-medium tracking-widest text-mist uppercase lg:inline">
                        {t('brand.edition')}
                    </span>
                </Link>

                <nav className="hidden items-center gap-6 md:flex" aria-label="Main">
                    {links.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className="text-sm font-medium text-mist transition-colors hover:text-foreground"
                        >
                            {link.label}
                        </Link>
                    ))}
                </nav>

                <div className="flex items-center gap-2.5">
                    <LocaleToggle />
                    <Link
                        href={auth.voter ? me(locale).url : login(locale).url}
                        aria-label={auth.voter ? t('nav.my_votes') : t('nav.login')}
                        className="text-mist transition-colors hover:text-foreground"
                    >
                        <CircleUserRound className="size-6" aria-hidden />
                    </Link>
                    <Button asChild size="sm" className="hidden font-semibold shadow-lift sm:inline-flex">
                        <Link href={nomineesIndex(locale).url}>{t('hero.cta_vote')}</Link>
                    </Button>
                </div>
            </div>
        </header>
    );
}
