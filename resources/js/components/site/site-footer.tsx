import { FormEvent, useState } from 'react';

import { useT } from '@/lib/i18n';

export function SiteFooter() {
    const { t } = useT();
    const [email, setEmail] = useState('');

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        // TODO wire to backend newsletter endpoint.
    };

    const year = new Date().getFullYear();

    return (
        <div id="footer" className="vl-footer4-section-area">
            <div className="container">
                <div className="row">
                    <div className="col-lg-12">
                        <div className="footer-bg-area">
                            <div className="row">
                                <div className="col-lg-3 col-md-6">
                                    <div className="footer-description-area">
                                        <img src="/template/img/logo/logo1.png" alt="Nexus" />
                                        <div className="space24" />
                                        <p>{t('footer.about')}</p>
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
                                        <h3>{t('footer.top_links')}</h3>
                                        <ul>
                                            <li><a href="#about">{t('footer.links.about')}</a></li>
                                            <li><a href="#schedule">{t('footer.links.events')}</a></li>
                                            <li><a href="#schedule">{t('footer.links.schedule')}</a></li>
                                            <li><a href="#tickets">{t('footer.links.pricing')}</a></li>
                                            <li><a href="#footer">{t('footer.links.contact')}</a></li>
                                        </ul>
                                    </div>
                                </div>
                                <div className="col-lg col-md-6">
                                    <div className="space30 d-lg-none d-block" />
                                    <div className="footer-links-area">
                                        <h3>{t('footer.map_title')}</h3>
                                        <div className="space24" />
                                        <div className="map">
                                            <iframe
                                                title={t('footer.map_title')}
                                                src="https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d4506257.120552435!2d88.67021924228865!3d21.954385721237916!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sen!2sbd!4v1704088968016!5m2!1sen!2sbd"
                                                width="600"
                                                height="450"
                                                style={{ border: 0 }}
                                                allowFullScreen
                                                loading="lazy"
                                                referrerPolicy="no-referrer-when-downgrade"
                                            />
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
                    <div className="space60" />
                </div>
            </div>
        </div>
    );
}
