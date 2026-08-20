import { Link, usePage } from '@inertiajs/react';
import { ArrowRight, CircleUserRound, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';
import { LocaleToggle } from '@/components/voter/locale-toggle';
import { PinwheelGlyph } from '@/components/voter/pinwheel-glyph';
import { useT } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import {
    home,
    howToVote,
    leaderboard,
    login,
    me,
    prizes,
    winners,
} from '@/routes';
import { index as nomineesIndex } from '@/routes/nominees';
import type { SharedData } from '@/types';

export function BrandMark({ className }: { className?: string }) {
    const { t } = useT();

    return (
        <span className={cn('flex items-center gap-2.5', className)}>
            <span className="flex size-9 items-center justify-center rounded-lg bg-brand text-white">
                <PinwheelGlyph className="size-5" />
            </span>
            <span className="leading-none">
                <span className="block font-display text-lg font-bold tracking-tight">
                    SocialCon <span className="text-sunrise">ACE</span>
                </span>
                <span className="mt-0.5 block text-[10px] font-semibold tracking-[0.18em] uppercase opacity-70">
                    {t('brand.edition')}
                </span>
            </span>
        </span>
    );
}

export function SiteHeader() {
    const { t, locale } = useT();
    const page = usePage<SharedData>();
    const { auth } = page.props;
    const currentPath = page.url.split('?')[0];

    const links = [
        { href: nomineesIndex(locale).url, label: t('nav.nominees') },
        { href: leaderboard(locale).url, label: t('nav.leaderboard') },
        { href: prizes(locale).url, label: t('nav.prizes') },
        { href: winners(locale).url, label: t('nav.winners') },
        { href: howToVote(locale).url, label: t('nav.how_to_vote') },
    ];

    const accountHref = auth.voter ? me(locale).url : login(locale).url;
    const accountLabel = auth.voter ? t('nav.my_votes') : t('nav.login');

    return (
        <header className="sticky top-0 z-40 border-b border-white/10 stage-flat">
            <div className="mx-auto flex h-[72px] max-w-6xl items-center justify-between gap-4 px-4">
                <Link href={home(locale).url} aria-label="SocialCon ACE">
                    <BrandMark />
                </Link>

                <nav
                    className="hidden items-center gap-7 lg:flex"
                    aria-label="Main"
                >
                    {links.map((link) => {
                        const active = currentPath.startsWith(link.href);

                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={cn(
                                    'relative text-[15px] font-medium transition-colors hover:text-white',
                                    active ? 'text-white' : 'text-white/70',
                                    active &&
                                        'after:absolute after:-bottom-1.5 after:left-0 after:h-0.5 after:w-full after:rounded-full after:bg-gold-fill',
                                )}
                            >
                                {link.label}
                            </Link>
                        );
                    })}
                </nav>

                <div className="flex items-center gap-2.5">
                    <div className="hidden sm:block">
                        <LocaleToggle />
                    </div>
                    <Link
                        href={accountHref}
                        className="hidden h-11 items-center gap-2 rounded-lg glass px-3.5 text-sm font-semibold text-white/85 transition-colors hover:text-white sm:flex"
                    >
                        <CircleUserRound className="size-5" aria-hidden />
                        {accountLabel}
                    </Link>
                    <Button asChild className="hidden sm:inline-flex">
                        <Link href={nomineesIndex(locale).url}>
                            {t('hero.cta_vote')}
                            <ArrowRight className="cta-arrow" aria-hidden />
                        </Link>
                    </Button>

                    <Sheet>
                        <SheetTrigger asChild>
                            <button
                                type="button"
                                aria-label={t('nav.menu')}
                                className="flex size-10 cursor-pointer items-center justify-center rounded-lg glass text-white lg:hidden"
                            >
                                <Menu className="size-5" aria-hidden />
                            </button>
                        </SheetTrigger>
                        <SheetContent
                            side="right"
                            className="w-[min(22rem,100vw)] border-white/10 bg-night p-0 text-white [&>button]:text-white"
                        >
                            <SheetHeader className="border-b border-white/10 p-5">
                                <SheetTitle className="text-white">
                                    <BrandMark />
                                </SheetTitle>
                            </SheetHeader>
                            <nav
                                className="flex flex-col gap-1 p-4"
                                aria-label={t('nav.menu')}
                            >
                                {[
                                    {
                                        href: home(locale).url,
                                        label: t('nav.home'),
                                    },
                                    ...links,
                                ].map((link) => (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        className="rounded-lg px-3 py-3 text-base font-semibold text-white/85 hover:bg-white/10 hover:text-white"
                                    >
                                        {link.label}
                                    </Link>
                                ))}
                                <Link
                                    href={accountHref}
                                    className="rounded-lg px-3 py-3 text-base font-semibold text-white/85 hover:bg-white/10 hover:text-white"
                                >
                                    {accountLabel}
                                </Link>
                            </nav>
                            <div className="flex items-center justify-between gap-3 border-t border-white/10 p-5">
                                <LocaleToggle />
                                <Button asChild>
                                    <Link href={nomineesIndex(locale).url}>
                                        {t('hero.cta_vote')}
                                        <ArrowRight
                                            className="cta-arrow"
                                            aria-hidden
                                        />
                                    </Link>
                                </Button>
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>
            </div>
        </header>
    );
}
