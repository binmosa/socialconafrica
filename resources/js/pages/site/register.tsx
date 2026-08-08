import { useForm, usePage } from '@inertiajs/react';
import { CSSProperties, FormEvent } from 'react';

import { InnerPageHeader } from '@/components/site/inner-page-header';
import SiteLayout from '@/layouts/site-layout';
import { useT } from '@/lib/i18n';

const COUNTRIES = [
    'Afghanistan', 'Albania', 'Algeria', 'Andorra', 'Angola', 'Argentina', 'Armenia', 'Australia', 'Austria', 'Azerbaijan',
    'Bahamas', 'Bahrain', 'Bangladesh', 'Barbados', 'Belarus', 'Belgium', 'Belize', 'Benin', 'Bhutan', 'Bolivia',
    'Bosnia and Herzegovina', 'Botswana', 'Brazil', 'Brunei', 'Bulgaria', 'Burkina Faso', 'Burundi', 'Cabo Verde',
    'Cambodia', 'Cameroon', 'Canada', 'Central African Republic', 'Chad', 'Chile', 'China', 'Colombia', 'Comoros',
    'Congo, Republic of the', 'Congo, Democratic Republic of the', 'Costa Rica', 'Croatia', 'Cuba', 'Cyprus',
    'Czech Republic', 'Denmark', 'Djibouti', 'Dominica', 'Dominican Republic', 'Ecuador', 'Egypt', 'El Salvador',
    'Equatorial Guinea', 'Eritrea', 'Estonia', 'Ethiopia', 'Fiji', 'Finland', 'France', 'Gabon', 'Gambia', 'Georgia',
    'Germany', 'Ghana', 'Greece', 'Grenada', 'Guatemala', 'Guinea', 'Guinea-Bissau', 'Guyana', 'Haiti', 'Honduras',
    'Hungary', 'Iceland', 'India', 'Indonesia', 'Iran', 'Iraq', 'Ireland', 'Israel', 'Italy', 'Jamaica', 'Japan',
    'Jordan', 'Kazakhstan', 'Kenya', 'Kuwait', 'Kyrgyzstan', 'Laos', 'Latvia', 'Lebanon', 'Lesotho', 'Liberia',
    'Libya', 'Liechtenstein', 'Lithuania', 'Luxembourg', 'Madagascar', 'Malawi', 'Malaysia', 'Maldives', 'Mali',
    'Malta', 'Mauritania', 'Mauritius', 'Mexico', 'Moldova', 'Monaco', 'Mongolia', 'Montenegro', 'Morocco',
    'Mozambique', 'Myanmar (Burma)', 'Namibia', 'Nepal', 'Netherlands', 'New Zealand', 'Nicaragua', 'Niger',
    'Nigeria', 'North Macedonia', 'Norway', 'Oman', 'Pakistan', 'Panama', 'Papua New Guinea', 'Paraguay', 'Peru',
    'Philippines', 'Poland', 'Portugal', 'Qatar', 'Romania', 'Russia', 'Rwanda', 'Saudi Arabia', 'Senegal', 'Serbia',
    'Sierra Leone', 'Singapore', 'Slovakia', 'Slovenia', 'Somalia', 'South Africa', 'South Korea', 'South Sudan',
    'Spain', 'Sri Lanka', 'Sudan', 'Sweden', 'Switzerland', 'Syria', 'Taiwan', 'Tajikistan', 'Tanzania', 'Thailand',
    'Togo', 'Trinidad and Tobago', 'Tunisia', 'Turkey', 'Turkmenistan', 'Uganda', 'Ukraine', 'United Arab Emirates',
    'United Kingdom', 'United States', 'Uruguay', 'Uzbekistan', 'Venezuela', 'Vietnam', 'Yemen', 'Zambia', 'Zimbabwe',
];

const FARE_ACCENTS: Record<string, string> = {
    'friday-free': 'var(--sca-green)',
    creator: 'var(--sca-yellow)',
    vip: 'var(--sca-blue)',
};

interface TierProp {
    slug: string;
    name: string;
    subtitle: string | null;
    priceMinor: number;
    perks: string[];
    badge: string | null;
}

interface RegisterProps {
    meta?: { title?: string };
    preselectedTier?: string | null;
    tiers: TierProp[];
}

function formatPrice(minor: number, freeLabel: string): string {
    return minor === 0 ? freeLabel : `$${(minor / 100).toLocaleString('en-US', { maximumFractionDigits: 2 })}`;
}

export default function Register({ meta, preselectedTier, tiers }: RegisterProps) {
    const { t, locale } = useT();
    const { flash } = usePage().props as unknown as { flash?: { success?: string; orderReference?: string } };

    const { data, setData, post, processing, errors } = useForm({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        country: '',
        organization: '',
        ticket_tier: preselectedTier ?? tiers[1]?.slug ?? tiers[0]?.slug ?? '',
        payment_method: 'credit_card',
    });

    const tier = tiers.find((item) => item.slug === data.ticket_tier) ?? tiers[0];
    const accent = FARE_ACCENTS[tier?.slug ?? ''] ?? 'var(--sca-pink)';

    const submit = (e: FormEvent) => {
        e.preventDefault();
        post(`/${locale}/register`, { preserveScroll: true });
    };

    if (flash?.success) {
        return (
            <SiteLayout meta={meta}>
                <InnerPageHeader title={t('register.success_title')} subtitle={flash.success}>
                    {flash.orderReference && (
                        <div style={{ marginTop: 24 }}>
                            <span className="sca-badge tier-title" style={{ fontSize: 16, padding: '12px 26px' }}>
                                {t('register.reference')}: {flash.orderReference}
                            </span>
                        </div>
                    )}
                </InnerPageHeader>
                <div className="bg-area4 sp6 sca-bg" />
            </SiteLayout>
        );
    }

    return (
        <SiteLayout meta={meta}>
            <InnerPageHeader title={t('register.payment.title')} subtitle={t('register.payment.body')} />

            <div className="bg-area4 sp6 sca-bg">
                <div className="container">
                    <form onSubmit={submit} className="sca-form">
                        <div className="row" style={{ rowGap: 30 }}>
                            {/* Billing details (payment.html left column) */}
                            <div className="col-lg-7">
                                <div className="sca-card">
                                    <h3>{t('register.billing')}</h3>
                                    <div className="space24" />
                                    <div className="row">
                                        <div className="col-md-6">
                                            <div className="sca-field">
                                                <label htmlFor="first_name">{t('register.personal.first_name')}</label>
                                                <input id="first_name" type="text" value={data.first_name} onChange={(e) => setData('first_name', e.target.value)} required />
                                                {errors.first_name && <span className="sca-error">{errors.first_name}</span>}
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="sca-field">
                                                <label htmlFor="last_name">{t('register.personal.last_name')}</label>
                                                <input id="last_name" type="text" value={data.last_name} onChange={(e) => setData('last_name', e.target.value)} required />
                                                {errors.last_name && <span className="sca-error">{errors.last_name}</span>}
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="sca-field">
                                                <label htmlFor="email">{t('register.personal.email')}</label>
                                                <input id="email" type="email" value={data.email} onChange={(e) => setData('email', e.target.value)} required />
                                                {errors.email && <span className="sca-error">{errors.email}</span>}
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="sca-field">
                                                <label htmlFor="phone">{t('register.personal.phone')}</label>
                                                <input id="phone" type="tel" value={data.phone} onChange={(e) => setData('phone', e.target.value)} required />
                                                {errors.phone && <span className="sca-error">{errors.phone}</span>}
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="sca-field">
                                                <label htmlFor="country">{t('register.personal.country')}</label>
                                                <select id="country" value={data.country} onChange={(e) => setData('country', e.target.value)} required>
                                                    <option value="">{t('register.personal.country_placeholder')}</option>
                                                    {COUNTRIES.map((country) => (
                                                        <option key={country} value={country}>{country}</option>
                                                    ))}
                                                </select>
                                                {errors.country && <span className="sca-error">{errors.country}</span>}
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="sca-field">
                                                <label htmlFor="organization">{t('register.personal.organization')}</label>
                                                <input id="organization" type="text" value={data.organization} onChange={(e) => setData('organization', e.target.value)} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Order summary cart (payment.html right column) */}
                            <div className="col-lg-5">
                                <div className="sca-card" style={{ borderTop: `4px solid ${accent}` } as CSSProperties}>
                                    <h3>{t('register.your_ticket')}</h3>
                                    <div className="space24" />
                                    <div className="sca-fare-tabs" role="tablist" style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                                        {tiers.map((item) => (
                                            <button
                                                key={item.slug}
                                                type="button"
                                                role="tab"
                                                aria-selected={item.slug === data.ticket_tier}
                                                onClick={() => setData('ticket_tier', item.slug)}
                                                className="sca-badge"
                                                style={{
                                                    border: 'none',
                                                    cursor: 'pointer',
                                                    padding: '10px 20px',
                                                    fontSize: 15,
                                                    background: item.slug === data.ticket_tier ? (FARE_ACCENTS[item.slug] ?? '#FF0A9D') : 'rgba(255,255,255,0.12)',
                                                    color: item.slug === data.ticket_tier ? '#0b0614' : '#fff',
                                                }}
                                            >
                                                {formatPrice(item.priceMinor, t('home.tickets.free'))}
                                            </button>
                                        ))}
                                    </div>
                                    {errors.ticket_tier && <span className="sca-error">{errors.ticket_tier}</span>}
                                    <div className="space24" />
                                    {tier && (
                                        <>
                                            <p style={{ display: 'flex', justifyContent: 'space-between', color: '#fff', fontWeight: 700 }}>
                                                <span>{tier.name}</span>
                                                <span>{formatPrice(tier.priceMinor, t('home.tickets.free'))}</span>
                                            </p>
                                            {tier.subtitle && (
                                                <p style={{ marginTop: 6 }} className="sca-meta">
                                                    {tier.subtitle}
                                                </p>
                                            )}
                                            <div className="space16" />
                                            <ul className="sca-perk-list">
                                                {tier.perks.map((perk) => (
                                                    <li key={perk}>{perk}</li>
                                                ))}
                                            </ul>
                                            <hr style={{ borderColor: 'rgba(255,255,255,0.2)', margin: '18px 0' }} />
                                            <p style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, color: '#fff', fontSize: 20 }}>
                                                <span>{t('register.payment.total')}</span>
                                                <span style={{ color: accent }}>{formatPrice(tier.priceMinor, t('home.tickets.free'))}</span>
                                            </p>
                                        </>
                                    )}
                                    <div className="space24" />
                                    <div className="sca-field">
                                        <label htmlFor="payment_method">{t('register.payment.method')}</label>
                                        <select id="payment_method" value={data.payment_method} onChange={(e) => setData('payment_method', e.target.value)}>
                                            <option value="credit_card">{t('register.payment.credit_card')}</option>
                                            <option value="paypal">{t('register.payment.paypal')}</option>
                                            <option value="bank_transfer">{t('register.payment.bank_transfer')}</option>
                                        </select>
                                        {errors.payment_method && <span className="sca-error">{errors.payment_method}</span>}
                                    </div>
                                    <p style={{ fontSize: 14 }}>
                                        <i className="fa-solid fa-lock" style={{ color: accent, marginRight: 8 }} />
                                        {t('register.payment.secure_note')}
                                    </p>
                                    <div className="space24" />
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="sca-buy-btn"
                                        style={{ background: accent } as CSSProperties}
                                    >
                                        {t('register.complete')} <i className="fa-solid fa-arrow-up-right-from-square" aria-hidden="true" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </SiteLayout>
    );
}
