import { Link, router, usePage } from '@inertiajs/react';
import { ArrowRight, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BrandMark } from '@/components/voter/site-header';
import { useT } from '@/lib/i18n';
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

export function SiteFooter() {
    const { t, locale } = useT();
    const { auth, activeDraw, votingWindow } = usePage<SharedData>().props;

    const campaignLinks = [
        { href: home(locale).url, label: t('nav.home') },
        { href: nomineesIndex(locale).url, label: t('nav.nominees') },
        { href: leaderboard(locale).url, label: t('nav.leaderboard') },
        { href: prizes(locale).url, label: t('nav.prizes') },
        { href: winners(locale).url, label: t('nav.winners') },
        { href: howToVote(locale).url, label: t('nav.how_to_vote') },
    ];

    const accountLinks = auth.voter
        ? [{ href: me(locale).url, label: t('nav.my_votes') }]
        : [{ href: login(locale).url, label: t('nav.login') }];

    const formatDate = (iso: string) =>
        new Date(iso).toLocaleDateString(locale === 'am' ? 'am-ET' : 'en-GB', {
            weekday: 'short',
            day: 'numeric',
            month: 'short',
        });

    const search = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const q = new FormData(event.currentTarget).get('q');
        router.get(
            nomineesIndex({ locale }, { query: q ? { q: String(q) } : {} }).url,
        );
    };

    return (
        <footer className="stage-flat pb-24 md:pb-0">
            <div className="mx-auto grid max-w-6xl gap-12 px-4 pt-16 pb-12 md:grid-cols-[1.5fr_1fr_1fr_1.2fr] md:pt-20">
                <div className="max-w-sm">
                    <BrandMark />
                    <p className="mt-5 text-[15px] leading-7 text-white/70">
                        {t('footer.description')}
                    </p>
                    <form onSubmit={search} className="relative mt-6">
                        <label htmlFor="footer-search" className="sr-only">
                            {t('footer.find_creator')}
                        </label>
                        <Search
                            className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-white/60"
                            aria-hidden
                        />
                        <input
                            id="footer-search"
                            name="q"
                            type="search"
                            placeholder={t('footer.find_creator')}
                            className="h-14 w-full rounded-lg glass pr-32 pl-11 text-sm text-white placeholder:text-white/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet"
                        />
                        <Button
                            type="submit"
                            size="sm"
                            className="absolute top-1/2 right-2 -translate-y-1/2"
                        >
                            {t('common.search')}
                            <ArrowRight className="cta-arrow" aria-hidden />
                        </Button>
                    </form>
                </div>

                <nav aria-label={t('footer.campaign')}>
                    <h3 className="font-display text-lg font-bold">
                        {t('footer.campaign')}
                    </h3>
                    <ul className="mt-5 space-y-3.5">
                        {campaignLinks.map((link) => (
                            <li key={link.href}>
                                <Link
                                    href={link.href}
                                    className="text-[15px] text-white/70 transition-all hover:pl-1 hover:text-pink"
                                >
                                    {link.label}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </nav>

                <nav aria-label={t('footer.account')}>
                    <h3 className="font-display text-lg font-bold">
                        {t('footer.account')}
                    </h3>
                    <ul className="mt-5 space-y-3.5">
                        {accountLinks.map((link) => (
                            <li key={link.href}>
                                <Link
                                    href={link.href}
                                    className="text-[15px] text-white/70 transition-all hover:pl-1 hover:text-pink"
                                >
                                    {link.label}
                                </Link>
                            </li>
                        ))}
                        <li>
                            <Link
                                href={howToVote(locale).url}
                                className="text-[15px] text-white/70 transition-all hover:pl-1 hover:text-pink"
                            >
                                {t('how_to_vote.title')}
                            </Link>
                        </li>
                    </ul>
                </nav>

                <div>
                    <h3 className="font-display text-lg font-bold">
                        {t('footer.this_week')}
                    </h3>
                    <dl className="mt-5 space-y-3.5 text-[15px]">
                        {activeDraw && (
                            <div className="flex items-center justify-between gap-3">
                                <dt className="text-white/60">
                                    {t('nav.draw')}
                                </dt>
                                <dd className="font-semibold text-gold-fill">
                                    {activeDraw.week_key}
                                </dd>
                            </div>
                        )}
                        {activeDraw && (
                            <div className="flex items-center justify-between gap-3">
                                <dt className="text-white/60">
                                    {t('footer.draw_closes')}
                                </dt>
                                <dd className="font-semibold">
                                    {formatDate(activeDraw.closes_at)}
                                </dd>
                            </div>
                        )}
                        {votingWindow.closes_at && (
                            <div className="flex items-center justify-between gap-3">
                                <dt className="text-white/60">
                                    {t('footer.voting_closes')}
                                </dt>
                                <dd className="font-semibold">
                                    {formatDate(votingWindow.closes_at)}
                                </dd>
                            </div>
                        )}
                        <div className="flex items-center justify-between gap-3">
                            <dt className="text-white/60">
                                {t('footer.price')}
                            </dt>
                            <dd className="font-semibold">
                                10 {t('common.etb')}
                            </dd>
                        </div>
                    </dl>
                </div>
            </div>

            <div className="border-t border-white/10">
                <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-6 text-[13px] text-white/60 md:flex-row md:items-center md:justify-between">
                    <p>{t('footer.rights')}</p>
                    <p>{t('brand.partner_note')}</p>
                </div>
            </div>
        </footer>
    );
}
