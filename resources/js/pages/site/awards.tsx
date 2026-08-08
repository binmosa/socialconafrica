import { Link } from '@inertiajs/react';
import { CSSProperties } from 'react';

import { InnerPageHeader } from '@/components/site/inner-page-header';

const ACCENTS = ['var(--sca-green)', 'var(--sca-yellow)', 'var(--sca-red)', 'var(--sca-blue)'];
import SiteLayout from '@/layouts/site-layout';
import { useT } from '@/lib/i18n';

interface CategoryProp {
    slug: string;
    name: string;
    description: string;
    icon: string | null;
}

interface AwardsProps {
    meta?: { title?: string };
    categories: CategoryProp[];
}

export default function Awards({ meta, categories }: AwardsProps) {
    const { t, locale } = useT();

    const galaDetails = [
        { icon: 'fa-regular fa-clock', label: t('awards.gala.time_label'), value: t('awards.gala.time') },
        { icon: 'fa-regular fa-calendar', label: t('awards.gala.date_label'), value: t('awards.gala.date') },
        { icon: 'fa-solid fa-user-tie', label: t('awards.gala.dress_label'), value: t('awards.gala.dress') },
        { icon: 'fa-solid fa-camera', label: t('awards.gala.experience_label'), value: t('awards.gala.experience') },
    ];

    return (
        <SiteLayout meta={meta}>
            <InnerPageHeader title={t('awards.title')} subtitle={t('awards.subtitle')} />

            <div className="bg-area4 sp6 sca-bg">
                <div className="container">
                    <div className="row">
                        <div className="col-lg-9 m-auto text-center">
                            <div className="heading4">
                                <h3 style={{ color: '#fff', fontSize: 26, fontWeight: 700 }}>{t('awards.narrative_1')}</h3>
                                <div className="space18" />
                                <p style={{ color: 'rgba(255,255,255,0.8)' }}>{t('awards.narrative_2')}</p>
                                <div className="space16" />
                                <p style={{ color: 'rgba(255,255,255,0.8)' }}>{t('awards.narrative_3')}</p>
                                <div className="space16" />
                                <p style={{ color: 'rgba(255,255,255,0.8)' }}>{t('awards.narrative_4')}</p>
                            </div>
                            <div className="space32" />
                            <div className="btn-area1" style={{ display: 'inline-block' }}>
                                <Link href={`/${locale}/vote`} className="vl-btn4">
                                    <span className="text">{t('awards.nominate_now')}</span>
                                    <span className="arrow">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 26 26" fill="none">
                                            <path d="M5 21L18 8" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            <path d="M8 8H19V19" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </span>
                                </Link>
                            </div>
                            <div className="space24" />
                            <p style={{ color: '#FF0A9D', fontWeight: 700 }}>{t('awards.tagline')}</p>
                            <p style={{ color: 'rgba(255,255,255,0.6)' }}>{t('awards.hashtags')}</p>
                        </div>
                    </div>

                    <div className="space70" />
                    <div className="heading4 text-center space-margin60">
                        <h2>{t('awards.categories_title')}</h2>
                    </div>
                    <div className="row" style={{ rowGap: 24 }}>
                        {categories.map((category, i) => (
                            <div key={category.slug} className="col-lg-4 col-md-6">
                                <div
                                    className="sca-card text-center"
                                    style={{ '--sca-accent': ACCENTS[i % ACCENTS.length] } as CSSProperties}
                                >
                                    <span className="sca-index" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
                                    <div className="sca-ring">
                                        <img src="/template/img/elements/elements29.png" alt="" className="sca-ring-shape" />
                                        <span className="sca-ring-inner">
                                            <i className={category.icon ?? 'fa-solid fa-trophy'} />
                                        </span>
                                    </div>
                                    <h3>{category.name}</h3>
                                    <p>{category.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="space70" />
                    <div className="heading4 text-center space-margin60">
                        <h2>{t('awards.gala.title')}</h2>
                    </div>
                    <div className="row" style={{ rowGap: 24 }}>
                        {galaDetails.map((detail) => (
                            <div key={detail.label} className="col-lg-3 col-md-6">
                                <div className="sca-card text-center">
                                    <span className="sca-icon">
                                        <i className={detail.icon} />
                                    </span>
                                    <h4>{detail.label}</h4>
                                    <p>{detail.value}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="space24" />
                    <p className="text-center" style={{ color: 'rgba(255,255,255,0.75)' }}>
                        {t('awards.gala.entertainment')}
                    </p>
                </div>
            </div>
        </SiteLayout>
    );
}
