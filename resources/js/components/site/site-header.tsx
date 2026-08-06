import { useEffect, useState } from 'react';

import { LocaleSwitcher } from '@/components/site/locale-switcher';
import { useT } from '@/lib/i18n';

export function SiteHeader() {
    const { t, locale } = useT();
    const [sticky, setSticky] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    useEffect(() => {
        const onScroll = () => setSticky(window.scrollY > 100);
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    const homeHref = `/${locale}`;

    return (
        <header className="homepage4-menu">
            <div id="vl-header-sticky" className={`vl-header-area vl-transparent-header ${sticky ? 'sticky' : ''}`}>
                <div className="container">
                    <div className="row align-items-center row-bg2">
                        <div className="col-lg-2 col-md-6 col-6">
                            <div className="vl-logo">
                                <a href={homeHref}>
                                    <img src="/template/img/logo/logo1.png" alt="Nexus" />
                                </a>
                            </div>
                        </div>
                        <div className="col-lg-7 d-none d-lg-block">
                            <div className="vl-main-menu text-center">
                                <nav>
                                    <ul>
                                        <li>
                                            <a href={homeHref}>{t('nav.home')}</a>
                                        </li>
                                        <li>
                                            <a href="#about">{t('nav.about')}</a>
                                        </li>
                                        <li>
                                            <a href="#schedule">{t('nav.events')}</a>
                                        </li>
                                        <li>
                                            <a href="#tickets">{t('nav.buy_ticket')}</a>
                                        </li>
                                        <li>
                                            <a href="#footer">{t('nav.contact')}</a>
                                        </li>
                                    </ul>
                                </nav>
                            </div>
                        </div>
                        <div className="col-lg-3 col-md-6 col-6">
                            <div className="vl-hero-btn d-none d-lg-flex align-items-center justify-content-end" style={{ gap: 16 }}>
                                <LocaleSwitcher />
                                <div className="btn-area1">
                                    <a href="#tickets" className="vl-btn4">
                                        <span className="text">{t('nav.buy_ticket')}</span>
                                        <span className="arrow">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 26 26" fill="none">
                                                <path d="M5 21L18 8" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                <path d="M8 8H19V19" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        </span>
                                    </a>
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
            <div className={`vl-offcanvas ${mobileOpen ? 'show' : ''}`} style={{ display: mobileOpen ? 'block' : 'none' }}>
                <div className="vl-offcanvas-wrapper">
                    <div className="vl-offcanvas-header d-flex justify-content-between align-items-center mb-90">
                        <div className="vl-offcanvas-logo">
                            <a href={homeHref}>
                                <img src="/template/img/logo/logo1.png" alt="Nexus" />
                            </a>
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
                                <li>
                                    <a href={homeHref} onClick={() => setMobileOpen(false)}>
                                        {t('nav.home')}
                                    </a>
                                </li>
                                <li>
                                    <a href="#about" onClick={() => setMobileOpen(false)}>
                                        {t('nav.about')}
                                    </a>
                                </li>
                                <li>
                                    <a href="#schedule" onClick={() => setMobileOpen(false)}>
                                        {t('nav.events')}
                                    </a>
                                </li>
                                <li>
                                    <a href="#tickets" onClick={() => setMobileOpen(false)}>
                                        {t('nav.buy_ticket')}
                                    </a>
                                </li>
                                <li>
                                    <a href="#footer" onClick={() => setMobileOpen(false)}>
                                        {t('nav.contact')}
                                    </a>
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
                        <a href="#" aria-label="Twitter"><i className="fab fa-twitter" /></a>
                        <a href="#" aria-label="LinkedIn"><i className="fab fa-linkedin-in" /></a>
                        <a href="#" aria-label="Instagram"><i className="fab fa-instagram" /></a>
                    </div>
                </div>
            </div>
            <div
                className={`vl-offcanvas-overlay ${mobileOpen ? 'show' : ''}`}
                onClick={() => setMobileOpen(false)}
                style={{ display: mobileOpen ? 'block' : 'none' }}
                aria-hidden="true"
            />
        </header>
    );
}
