import { Link } from '@inertiajs/react';
import { CSSProperties, useState } from 'react';

const TIER_ACCENTS: Record<string, string> = {
    title: 'var(--sca-pink)',
    platinum: '#7C5CB8',
    gold: 'var(--sca-yellow)',
    supporting: 'var(--sca-green)',
};

import { FilterChips } from '@/components/site/filter-chips';
import { InnerPageHeader } from '@/components/site/inner-page-header';
import SiteLayout from '@/layouts/site-layout';
import { useT } from '@/lib/i18n';

interface TierProp {
    slug: string;
    name: string;
}

interface SponsorProp {
    name: string;
    tier: TierProp;
    description: string | null;
    url: string | null;
    logo: string | null;
}

interface SponsorsProps {
    meta?: { title?: string };
    tiers: TierProp[];
    sponsors: SponsorProp[];
}

export default function Sponsors({ meta, tiers, sponsors }: SponsorsProps) {
    const { t, locale } = useT();
    const [tier, setTier] = useState('all');

    const chips = [
        { value: 'all', label: t('sponsors_page.filters.all') },
        ...tiers.map((item) => ({ value: item.slug, label: item.name })),
    ];

    const visible = sponsors.filter((sponsor) => tier === 'all' || sponsor.tier.slug === tier);

    const packages = [0, 1, 2].map((i) => ({
        name: t(`sponsors_page.packages.${i}.name`),
        features: [0, 1, 2, 3, 4, 5].map((j) => t(`sponsors_page.packages.${i}.features.${j}`)),
    }));

    return (
        <SiteLayout meta={meta}>
            <InnerPageHeader title={t('sponsors_page.title')} subtitle={t('sponsors_page.subtitle')} />

            <div
                className="bg-area4 sp6"
                style={{
                    backgroundImage: 'url(/template/img/all-images/bg/bg4.png)',
                    backgroundPosition: 'center top',
                    backgroundSize: 'cover',
                }}
            >
                <div className="container">
                    <FilterChips chips={chips} active={tier} onChange={setTier} />
                    <div className="space48" />
                    <div className="row" style={{ rowGap: 24 }}>
                        {visible.map((sponsor) => (
                            <div key={sponsor.name} className="col-lg-4 col-md-6">
                                <a href={sponsor.url ?? '#'} target="_blank" rel="noreferrer" style={{ display: 'block', height: '100%' }}>
                                    <div
                                        className="sca-sponsor-card"
                                        style={{ '--tier-accent': TIER_ACCENTS[sponsor.tier.slug] ?? 'var(--sca-pink)' } as CSSProperties}
                                    >
                                        <div className="sca-sponsor-top">
                                            <span className="sca-logo-tile">
                                                {sponsor.logo ? (
                                                    <img src={sponsor.logo} alt={sponsor.name} loading="lazy" />
                                                ) : (
                                                    <span className="sca-logo-mono">{sponsor.name.slice(0, 2).toUpperCase()}</span>
                                                )}
                                            </span>
                                            <span className={`sca-badge tier-${sponsor.tier.slug}`}>{sponsor.tier.name}</span>
                                        </div>
                                        <h3>{sponsor.name}</h3>
                                        <p>{sponsor.description}</p>
                                        <span className="sca-sponsor-link">
                                            {t('common.learn_more')} <i className="fa-solid fa-arrow-up-right-from-square" />
                                        </span>
                                    </div>
                                </a>
                            </div>
                        ))}
                    </div>

                    <div className="space70" />
                    <div className="heading4 text-center space-margin60">
                        <h2>{t('sponsors_page.packages_title')}</h2>
                    </div>
                    <div className="row" style={{ rowGap: 24 }}>
                        {packages.map((pkg) => (
                            <div key={pkg.name} className="col-lg-4 col-md-6">
                                <div className="sca-option" style={{ cursor: 'default' }}>
                                    <h3 style={{ color: '#fff', fontSize: 24, fontWeight: 700 }}>{pkg.name}</h3>
                                    <ul>
                                        {pkg.features.map((feature) => (
                                            <li key={feature}>{feature}</li>
                                        ))}
                                    </ul>
                                    <div className="space24" />
                                    <Link href={`/${locale}/contact`} className="sca-badge tier-title" style={{ textDecoration: 'none' }}>
                                        {t('sponsors_page.package_cta')}
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="space70" />
                    <div className="text-center">
                        <div className="heading4">
                            <h2>{t('sponsors_page.become.title')}</h2>
                            <div className="space18" />
                            <p style={{ color: 'rgba(255,255,255,0.75)' }}>{t('sponsors_page.become.body')}</p>
                        </div>
                        <div className="space32" />
                        <div className="btn-area1" style={{ display: 'inline-block' }}>
                            <Link href={`/${locale}/contact`} className="vl-btn4">
                                <span className="text">{t('sponsors_page.become.button')}</span>
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
