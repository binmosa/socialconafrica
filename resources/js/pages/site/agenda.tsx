import { Link } from '@inertiajs/react';
import { useState } from 'react';

import { FilterChips } from '@/components/site/filter-chips';
import { InnerPageHeader } from '@/components/site/inner-page-header';
import SiteLayout from '@/layouts/site-layout';
import { useT } from '@/lib/i18n';

interface AgendaItemProp {
    id: number;
    time: string;
    kind: string;
    track: string | null;
    title: string;
    description: string | null;
    location: string | null;
    speaker: string | null;
    icsUrl: string;
}

interface AgendaDayProp {
    id: number;
    label: string;
    title: string;
    items: AgendaItemProp[];
}

interface AgendaProps {
    meta?: { title?: string };
    days: AgendaDayProp[];
}

export default function Agenda({ meta, days }: AgendaProps) {
    const { t, locale } = useT();
    const [track, setTrack] = useState('all');

    const trackChips = ['all', 'creator_economy', 'business', 'policy'].map((value) => ({
        value,
        label: t(`agenda.tracks.${value}`),
    }));

    return (
        <SiteLayout meta={meta}>
            <InnerPageHeader title={t('agenda.title')} subtitle={t('agenda.subtitle')} />

            <div
                className="bg-area4 sp6"
                style={{
                    backgroundImage: 'url(/template/img/all-images/bg/bg4.png)',
                    backgroundPosition: 'center top',
                    backgroundSize: 'cover',
                }}
            >
                <div className="container">
                    <FilterChips chips={trackChips} active={track} onChange={setTrack} />
                    <div className="space48" />

                    {days.map((day) => {
                        const visibleItems = day.items.filter((item) => track === 'all' || item.track === track || item.track === null);

                        return (
                            <div key={day.id}>
                                <div className="heading4 text-center space-margin60">
                                    <h5>
                                        <img src="/template/img/icons/sub-logo3.svg" alt="" /> {day.label}
                                    </h5>
                                    <div className="space20" />
                                    <h2>{day.title}</h2>
                                </div>
                                <div className="row" style={{ rowGap: 20 }}>
                                    {visibleItems.map((item) => (
                                        <div key={item.id} className="col-lg-10 m-auto">
                                            <div className="sca-card">
                                                <div className="sca-agenda-row">
                                                    <div className="sca-time">{item.time}</div>
                                                    <div style={{ flex: 1 }}>
                                                        <span className={`sca-badge kind-${item.kind}`}>{t(`agenda.kinds.${item.kind}`)}</span>
                                                        <div className="space16" />
                                                        <h3>{item.title}</h3>
                                                        {item.speaker && <p className="sca-meta">{item.speaker}</p>}
                                                        {item.location && (
                                                            <p style={{ marginTop: 6 }}>
                                                                <i className="fa-solid fa-location-dot" style={{ color: '#FF0A9D', marginRight: 8 }} />
                                                                {item.location}
                                                            </p>
                                                        )}
                                                        {item.description && <p style={{ marginTop: 6 }}>{item.description}</p>}
                                                        <div className="space16" />
                                                        <a
                                                            href={item.icsUrl}
                                                            className="sca-badge"
                                                            style={{ textDecoration: 'none' }}
                                                            download
                                                        >
                                                            <i className="fa-regular fa-calendar-plus" style={{ marginRight: 8 }} />
                                                            {t('agenda.add_to_calendar')}
                                                        </a>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}

                    <div className="space70" />
                    <div className="text-center">
                        <div className="heading4">
                            <h2>{t('agenda.cta.title')}</h2>
                            <div className="space18" />
                            <p style={{ color: 'rgba(255,255,255,0.75)' }}>{t('agenda.cta.body')}</p>
                        </div>
                        <div className="space32" />
                        <div className="btn-area1" style={{ display: 'inline-block' }}>
                            <Link href={`/${locale}/register`} className="vl-btn4">
                                <span className="text">{t('agenda.cta.button')}</span>
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
