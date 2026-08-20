import { Link } from '@inertiajs/react';
import { home, howToVote, leaderboard, prizes, winners } from '@/routes';
import { index as nomineesIndex } from '@/routes/nominees';
import { useT } from '@/lib/i18n';

export function SiteFooter() {
    const { t, locale } = useT();

    const campaignLinks = [
        { href: home(locale).url, label: t('nav.home') },
        { href: nomineesIndex(locale).url, label: t('nav.nominees') },
        { href: leaderboard(locale).url, label: t('nav.leaderboard') },
        { href: prizes(locale).url, label: t('nav.prizes') },
        { href: winners(locale).url, label: t('nav.winners') },
        { href: howToVote(locale).url, label: t('nav.how_to_vote') },
    ];

    return (
        <footer className="border-t border-border bg-paper-soft pb-20 md:pb-0">
            <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 md:grid-cols-[2fr_1fr]">
                <div className="max-w-sm space-y-3">
                    <p className="font-display text-lg font-bold">
                        SocialCon <span className="text-gold">ACE</span>
                    </p>
                    <p className="text-sm text-mist">{t('footer.description')}</p>
                    <p className="text-xs text-mist/80">{t('brand.partner_note')}</p>
                </div>

                <nav aria-label={t('footer.campaign')} className="space-y-3">
                    <p className="text-xs font-semibold tracking-widest text-mist uppercase">
                        {t('footer.campaign')}
                    </p>
                    <ul className="space-y-2">
                        {campaignLinks.map((link) => (
                            <li key={link.href}>
                                <Link
                                    href={link.href}
                                    className="text-sm text-mist transition-colors hover:text-foreground"
                                >
                                    {link.label}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </nav>
            </div>
            <div className="border-t border-border/60">
                <p className="mx-auto max-w-6xl px-4 py-4 text-xs text-mist/80">
                    {t('footer.rights')}
                </p>
            </div>
        </footer>
    );
}
