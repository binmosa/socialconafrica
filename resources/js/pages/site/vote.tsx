import { InnerPageHeader } from '@/components/site/inner-page-header';
import SiteLayout from '@/layouts/site-layout';
import { useT } from '@/lib/i18n';

interface NomineeProp {
    name: string;
    country: string | null;
    photo: string | null;
}

interface CategoryProp {
    slug: string;
    name: string;
    description: string;
    icon: string | null;
    nominees: NomineeProp[];
}

interface VoteProps {
    meta?: { title?: string };
    votingOpen: boolean;
    categories: CategoryProp[];
}

export default function Vote({ meta, votingOpen, categories }: VoteProps) {
    const { t } = useT();

    return (
        <SiteLayout meta={meta}>
            <InnerPageHeader title={t('vote.title')} subtitle={t('vote.subtitle')}>
                {!votingOpen && (
                    <div style={{ marginTop: 24 }}>
                        <span className="sca-badge tier-title" style={{ fontSize: 15, padding: '10px 24px' }}>
                            <i className="fa-regular fa-clock" style={{ marginRight: 8 }} />
                            {t('vote.opens_soon')}
                        </span>
                    </div>
                )}
            </InnerPageHeader>

            <div
                className="bg-area4 team4-section-area sp6"
                style={{
                    backgroundImage: 'url(/template/img/all-images/bg/bg4.png)',
                    backgroundPosition: 'center top',
                    backgroundSize: 'cover',
                }}
            >
                <div className="container">
                    {!votingOpen && (
                        <div className="row">
                            <div className="col-lg-8 m-auto text-center">
                                <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 18 }}>{t('vote.note')}</p>
                            </div>
                        </div>
                    )}
                    <div className="space48" />
                    {categories.map((category) => (
                        <div key={category.slug} style={{ marginBottom: 64 }}>
                            <div className="heading4 space-margin60">
                                <h5>
                                    <i className={category.icon ?? 'fa-solid fa-trophy'} style={{ color: '#FF0A9D', marginRight: 10 }} />
                                    {category.name}
                                </h5>
                                <div className="space16" />
                                <p style={{ color: 'rgba(255,255,255,0.7)' }}>{category.description}</p>
                            </div>
                            <div className="team-widget-slider">
                                <div className="row" style={{ rowGap: 30 }}>
                                    {category.nominees.map((nominee) => (
                                        <div key={nominee.name} className="col-lg-3 col-md-6">
                                            <div className="team-single-boxarea sca-nominee">
                                                <div className="img1">
                                                    <img
                                                        src={nominee.photo ?? '/template/img/all-images/team/team-img6.png'}
                                                        alt={nominee.name}
                                                        loading="lazy"
                                                    />
                                                </div>
                                                <div className="space32" />
                                                <div className="content-area">
                                                    <a href="#">{nominee.name}</a>
                                                    <div className="space10" />
                                                    <p>{nominee.country}</p>
                                                    <div className="space16" />
                                                    <span className="sca-vote-soon">
                                                        <i className="fa-regular fa-clock" style={{ marginRight: 8 }} />
                                                        {t('vote.opens_soon')}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </SiteLayout>
    );
}
