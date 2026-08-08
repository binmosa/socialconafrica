import { Link, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';

import { LocaleSwitcher } from '@/components/site/locale-switcher';
import { useT } from '@/lib/i18n';

const NAV_ITEMS = [
    { key: 'home', path: '' },
    { key: 'agenda', path: '/agenda' },
    { key: 'speakers', path: '/speakers' },
    { key: 'sponsors', path: '/sponsors' },
    { key: 'awards', path: '/awards' },
    { key: 'vote', path: '/vote' },
    { key: 'contact', path: '/contact' },
] as const;

export function SiteHeader() {
    const { t, locale } = useT();
    const { url } = usePage();
    const [sticky, setSticky] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    useEffect(() => {
        const onScroll = () => setSticky(window.scrollY > 100);
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    const currentPath = url.split('?')[0].split('#')[0];

    const isActive = (path: string): boolean => {
        const href = `/${locale}${path}`;
        return path === '' ? currentPath === href || currentPath === `${href}/` : currentPath.startsWith(href);
    };

    const registerHref = `/${locale}/register`;

    const navLinks = (onClick?: () => void) =>
        NAV_ITEMS.map((item) => (
            <li key={item.key}>
                <Link
                    href={`/${locale}${item.path}`}
                    onClick={onClick}
                    className={isActive(item.path) ? 'active' : undefined}
                    style={isActive(item.path) ? { color: '#FF0A9D' } : undefined}
                >
                    {t(`nav.${item.key}`)}
                </Link>
            </li>
        ));

    return (
        <header className="homepage4-menu">
            <div id="vl-header-sticky" className={`vl-header-area vl-transparent-header ${sticky ? 'header-sticky' : ''}`}>
                <div className="container">
                    <div className="row align-items-center row-bg2 flex-nowrap">
                        <div className="col-6 col-lg-auto">
                            <div className="vl-logo">
                                <Link href={`/${locale}`}>
                                    <img src="/image/logo.png" alt={t('meta.title')} />
                                </Link>
                            </div>
                        </div>
                        <div className="col-lg d-none d-lg-block" style={{ minWidth: 0 }}>
                            <div className="vl-main-menu text-center">
                                <nav>
                                    <ul>{navLinks()}</ul>
                                </nav>
                            </div>
                        </div>
                        <div className="col-6 col-lg-auto">
                            <div className="vl-hero-btn d-none d-lg-flex align-items-center justify-content-end">
                                <LocaleSwitcher />
                                <div className="btn-area1">
                                    <Link href={registerHref} className="vl-btn4">
                                        <span className="text">{t('nav.register')}</span>
                                        <span className="arrow">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 26 26" fill="none">
                                                <path d="M5 21L18 8" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                <path d="M8 8H19V19" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        </span>
                                    </Link>
                                </div>
                            </div>
                            <div className="vl-header-action-item d-block d-lg-none text-end">
                                <button
                                    type="button"
                                    className="vl-offcanvas-toggle"
                                    aria-label="Open menu"
                                    onClick={() => setMobileOpen(true)}
                                >
                                    <i className="fa-solid fa-bars-staggered" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile offcanvas */}
            <div className={`vl-offcanvas ${mobileOpen ? 'vl-offcanvas-open' : ''}`}>
                <div className="vl-offcanvas-wrapper">
                    <div className="vl-offcanvas-header d-flex justify-content-between align-items-center mb-90">
                        <div className="vl-offcanvas-logo">
                            <Link href={`/${locale}`}>
                                <img src="/image/logo.png" alt={t('meta.title')} />
                            </Link>
                        </div>
                        <div className="vl-offcanvas-close">
                            <button
                                type="button"
                                className="vl-offcanvas-close-toggle"
                                aria-label="Close menu"
                                onClick={() => setMobileOpen(false)}
                            >
                                <i className="fa-solid fa-xmark" />
                            </button>
                        </div>
                    </div>
                    <div className="vl-offcanvas-menu d-lg-none mb-40">
                        <nav>
                            <ul>
                                {navLinks(() => setMobileOpen(false))}
                                <li>
                                    <Link href={registerHref} onClick={() => setMobileOpen(false)}>
                                        {t('nav.register')}
                                    </Link>
                                </li>
                            </ul>
                        </nav>
                        <div className="space20" />
                        <LocaleSwitcher />
                    </div>
                    <div className="space20" />
                    <div className="vl-offcanvas-info">
                        <h3 className="vl-offcanvas-sm-title">{t('header.contact_us')}</h3>
                        <div className="space20" />
                        <span>
                            <a href={`tel:${t('header.phone').replace(/\s+/g, '')}`}>
                                <i className="fa-solid fa-phone" /> {t('header.phone')}
                            </a>
                        </span>
                        <span>
                            <a href={`mailto:${t('header.email')}`}>
                                <i className="fa-regular fa-envelope" /> {t('header.email')}
                            </a>
                        </span>
                        <span>
                            <a href="#">
                                <i className="fa-solid fa-location-dot" /> {t('header.address')}
                            </a>
                        </span>
                    </div>
                    <div className="space20" />
                    <div className="vl-offcanvas-social">
                        <h3 className="vl-offcanvas-sm-title">{t('header.follow_us')}</h3>
                        <div className="space20" />
                        <a href="#" aria-label="Facebook"><i className="fab fa-facebook-f" /></a>
                        <a href="#" aria-label="X"><i className="fab fa-x-twitter" /></a>
                        <a href="#" aria-label="LinkedIn"><i className="fab fa-linkedin-in" /></a>
                        <a href="#" aria-label="Instagram"><i className="fab fa-instagram" /></a>
                        <a href="#" aria-label="TikTok"><i className="fab fa-tiktok" /></a>
                    </div>
                </div>
            </div>
            <div
                className={`vl-offcanvas-overlay ${mobileOpen ? 'vl-offcanvas-overlay-open' : ''}`}
                onClick={() => setMobileOpen(false)}
                aria-hidden="true"
            />
        </header>
    );
}
