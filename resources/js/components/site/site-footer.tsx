import { Link } from '@inertiajs/react';
import { FormEvent, useState } from 'react';

import { useT } from '@/lib/i18n';

export function SiteFooter() {
    const { t, locale } = useT();
    const [email, setEmail] = useState('');

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        // TODO wire to backend newsletter endpoint.
    };

    const year = new Date().getFullYear();

    const quickLinks = [
        { label: t('footer.links.home'), href: `/${locale}` },
        { label: t('footer.links.agenda'), href: `/${locale}/agenda` },
        { label: t('footer.links.speakers'), href: `/${locale}/speakers` },
        { label: t('footer.links.sponsors'), href: `/${locale}/sponsors` },
        { label: t('footer.links.register'), href: `/${locale}/register` },
        { label: t('footer.links.contact'), href: `/${locale}/contact` },
    ];

    const exploreLinks = [
        { label: t('footer.explore_links.faqs'), href: '#' },
        { label: t('footer.explore_links.venue'), href: `/${locale}#about` },
        { label: t('footer.explore_links.travel'), href: `/${locale}/register` },
        { label: t('footer.explore_links.press'), href: `/${locale}/contact` },
        { label: t('footer.explore_links.careers'), href: '#' },
        { label: t('footer.explore_links.volunteer'), href: `/${locale}/contact` },
    ];

    return (
        <div id="footer" className="vl-footer4-section-area">
            <div className="footer-bg-area">
                <div className="container">
                    <div className="row">
                        <div className="col-lg-4 col-md-6">
                            <div className="footer-description-area">
                                <img src="/image/logo.png" alt={t('meta.title')} />
                                <div className="space24" />
                                <h3 style={{ color: '#fff', fontSize: 20, fontWeight: 700, lineHeight: 1.4 }}>{t('footer.cta_title')}</h3>
                                <div className="space16" />
                                <p>
                                    <strong>{t('footer.cta_lead')}</strong> {t('footer.cta_body')}
                                </p>
                                <div className="space16" />
                                <p>{t('footer.cta_highlights')}</p>
                                <div className="space24" />
                                <div className="form-area">
                                    <form onSubmit={handleSubmit}>
                                        <input
                                            type="email"
                                            required
                                            placeholder={t('footer.newsletter_placeholder')}
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                        />
                                        <button type="submit" aria-label="Subscribe">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="29" height="28" viewBox="0 0 29 28" fill="none">
                                                <path d="M6.33203 22.168L20.332 8.16797" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                                                <path d="M8.95703 8.16797H20.332V19.543" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        </button>
                                    </form>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg col-md-6">
                            <div className="space30 d-md-none d-block" />
                            <div className="footer-links-area padding-top">
                                <h3>{t('footer.quick_links')}</h3>
                                <ul>
                                    {quickLinks.map((link) => (
                                        <li key={link.label}>
                                            <Link href={link.href}>{link.label}</Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                        <div className="col-lg col-md-6">
                            <div className="space30 d-lg-none d-block" />
                            <div className="footer-links-area padding-top">
                                <h3>{t('footer.explore')}</h3>
                                <ul>
                                    {exploreLinks.map((link) =>
                                        link.href.startsWith('#') ? (
                                            <li key={link.label}>
                                                <a href={link.href}>{link.label}</a>
                                            </li>
                                        ) : (
                                            <li key={link.label}>
                                                <Link href={link.href}>{link.label}</Link>
                                            </li>
                                        ),
                                    )}
                                </ul>
                            </div>
                        </div>
                        <div className="col-lg col-md-6">
                            <div className="space30 d-lg-none d-block" />
                            <div className="footer-links-area padding-top">
                                <h3>{t('header.contact_us')}</h3>
                                <ul>
                                    <li>
                                        <a href={`mailto:${t('header.email')}`}>
                                            <i className="fa-regular fa-envelope" /> {t('header.email')}
                                        </a>
                                    </li>
                                    <li>
                                        <a href={`tel:${t('header.phone').replace(/\s+/g, '')}`}>
                                            <i className="fa-solid fa-phone" /> {t('header.phone')}
                                        </a>
                                    </li>
                                    <li>
                                        <a href="#">
                                            <i className="fa-solid fa-location-dot" /> {t('header.address')}
                                        </a>
                                    </li>
                                </ul>
                                <div className="space24" />
                                <div className="vl-offcanvas-social">
                                    <a href="#" aria-label="Facebook"><i className="fab fa-facebook-f" /></a>
                                    <a href="#" aria-label="X"><i className="fab fa-x-twitter" /></a>
                                    <a href="#" aria-label="LinkedIn"><i className="fab fa-linkedin-in" /></a>
                                    <a href="#" aria-label="Instagram"><i className="fab fa-instagram" /></a>
                                    <a href="#" aria-label="TikTok"><i className="fab fa-tiktok" /></a>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="space60" />
                    <div className="row">
                        <div className="col-lg-12">
                            <div className="copyright-area">
                                <p>{t('footer.copyright', { year })}</p>
                                <ul>
                                    <li><a href="#">{t('footer.privacy')}</a> <span> | </span></li>
                                    <li><a href="#">{t('footer.terms')}</a></li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
