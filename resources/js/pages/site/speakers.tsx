import { Link } from '@inertiajs/react';
import { useState } from 'react';

import { FilterChips } from '@/components/site/filter-chips';
import { InnerPageHeader } from '@/components/site/inner-page-header';
import SiteLayout from '@/layouts/site-layout';
import { useT } from '@/lib/i18n';

interface SpeakerProp {
    name: string;
    role: string;
    photo: string | null;
    category: string;
}

interface SpeakersProps {
    meta?: { title?: string };
    speakers: SpeakerProp[];
}

export default function Speakers({ meta, speakers }: SpeakersProps) {
    const { t, locale } = useT();
    const [category, setCategory] = useState('all');

    const chips = ['all', 'creator_economy', 'business', 'policy', 'technology'].map((value) => ({
        value,
        label: t(`speakers_page.filters.${value}`),
    }));

    const visible = speakers.filter((speaker) => category === 'all' || speaker.category === category);

    return (
        <SiteLayout meta={meta}>
            <InnerPageHeader title={t('speakers_page.title')} subtitle={t('speakers_page.subtitle')} />

            <div
                className="bg-area4 team4-section-area sp6"
                style={{
                    backgroundImage: 'url(/template/img/all-images/bg/bg4.png)',
                    backgroundPosition: 'center top',
                    backgroundSize: 'cover',
                }}
            >
                <div className="container">
                    <FilterChips chips={chips} active={category} onChange={setCategory} />
                    <div className="space48" />
                    <div className="team-widget-slider">
                        <div className="row" style={{ rowGap: 30 }}>
                            {visible.map((speaker) => (
                                <div key={speaker.name} className="col-lg-3 col-md-6">
                                    <div className="team-single-boxarea">
                                        <div className="img1">
                                            <img src={speaker.photo ?? '/template/img/all-images/team/team-img6.png'} alt={speaker.name} loading="lazy" />
                                            <ul>
                                                <li><a href="#" aria-label="Facebook"><i className="fa-brands fa-facebook-f" /></a></li>
                                                <li><a href="#" aria-label="LinkedIn"><i className="fa-brands fa-linkedin-in" /></a></li>
                                                <li><a href="#" aria-label="Instagram"><i className="fa-brands fa-instagram" /></a></li>
                                            </ul>
                                        </div>
                                        <div className="space32" />
                                        <div className="content-area">
                                            <a href="#">{speaker.name}</a>
                                            <div className="space10" />
                                            <p>{speaker.role}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="space70" />
                    <div className="text-center">
                        <div className="heading4">
                            <h2>{t('speakers_page.apply.title')}</h2>
                            <div className="space18" />
                            <p style={{ color: 'rgba(255,255,255,0.75)' }}>{t('speakers_page.apply.body')}</p>
                        </div>
                        <div className="space32" />
                        <div className="btn-area1" style={{ display: 'inline-block' }}>
                            <Link href={`/${locale}/contact`} className="vl-btn4">
                                <span className="text">{t('speakers_page.apply.button')}</span>
                                <span className="arrow">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 26 26" fill="none">
                                        <path d="M5 21L18 8" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        <path d="M8 8H19V19" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </span>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </SiteLayout>
    );
}
