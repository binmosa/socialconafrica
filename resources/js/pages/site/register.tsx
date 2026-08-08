import { useForm, usePage } from '@inertiajs/react';
import { FormEvent, useState } from 'react';

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

interface TierProp {
    slug: string;
    name: string;
    subtitle: string | null;
    priceMinor: number;
    perks: string[];
    badge: string | null;
}

interface HotelProp {
    slug: string;
    name: string;
    note: string | null;
}

interface AddonProp {
    slug: string;
    name: string;
    priceMinor: number;
}

interface RegisterProps {
    meta?: { title?: string };
    tiers: TierProp[];
    hotels: HotelProp[];
    addons: AddonProp[];
}

function formatPrice(minor: number, freeLabel: string): string {
    return minor === 0 ? freeLabel : `$${(minor / 100).toLocaleString('en-US', { maximumFractionDigits: 2 })}`;
}

export default function Register({ meta, tiers, hotels, addons }: RegisterProps) {
    const { t, locale } = useT();
    const { flash } = usePage().props as unknown as { flash?: { success?: string; orderReference?: string } };
    const [step, setStep] = useState(0);
    const [stepError, setStepError] = useState<string | null>(null);

    const { data, setData, post, processing, errors } = useForm({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        country: '',
        organization: '',
        ticket_tier: '',
        hotel: '',
        addons: [] as string[],
        payment_method: 'credit_card',
    });

    const steps = [0, 1, 2, 3, 4].map((i) => t(`register.steps.${i}`));

    const selectedTier = tiers.find((tier) => tier.slug === data.ticket_tier);
    const selectedAddons = addons.filter((addon) => data.addons.includes(addon.slug));
    const totalMinor = (selectedTier?.priceMinor ?? 0) + selectedAddons.reduce((sum, addon) => sum + addon.priceMinor, 0);

    const canAdvance = (): boolean => {
        if (step === 0) {
            return Boolean(data.first_name && data.last_name && data.email && data.phone && data.country);
        }
        if (step === 1) {
            return Boolean(data.ticket_tier);
        }
        if (step === 2) {
            return Boolean(data.hotel);
        }
        return true;
    };

    const next = () => {
        if (!canAdvance()) {
            setStepError(t('register.personal.body'));
            return;
        }
        setStepError(null);
        setStep((current) => Math.min(current + 1, 4));
        window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
    };

    const previous = () => {
        setStepError(null);
        setStep((current) => Math.max(current - 1, 0));
    };

    const toggleAddon = (slug: string) => {
        setData('addons', data.addons.includes(slug) ? data.addons.filter((item) => item !== slug) : [...data.addons, slug]);
    };

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
                <div
                    className="bg-area4 sp6"
                    style={{ backgroundImage: 'url(/template/img/all-images/bg/bg4.png)', backgroundSize: 'cover' }}
                />
            </SiteLayout>
        );
    }

    return (
        <SiteLayout meta={meta}>
            <InnerPageHeader title={t('register.personal.title')} subtitle={t('register.personal.body')} />

            <div
                className="bg-area4 sp6"
                style={{
                    backgroundImage: 'url(/template/img/all-images/bg/bg4.png)',
                    backgroundPosition: 'center top',
                    backgroundSize: 'cover',
                }}
            >
                <div className="container">
                    <div className="row">
                        <div className="col-lg-10 m-auto">
                            <div className="sca-stepper" role="list">
                                {steps.map((label, i) => (
                                    <div key={label} role="listitem" className={`sca-step ${i === step ? 'active' : ''} ${i < step ? 'done' : ''}`}>
                                        <span className="sca-step-dot">{i < step ? <i className="fa-solid fa-check" /> : i + 1}</span>
                                        <span className="sca-step-label" style={{ display: 'block' }}>{label}</span>
                                    </div>
                                ))}
                            </div>

                            <form onSubmit={submit} className="sca-form">
                                {step === 0 && (
                                    <div className="sca-card">
                                        <h3>{t('register.personal.title')}</h3>
                                        <p>{t('register.personal.body')}</p>
                                        <div className="space24" />
                                        <div className="row">
                                            <div className="col-md-6">
                                                <div className="sca-field">
                                                    <label htmlFor="first_name">{t('register.personal.first_name')}</label>
                                                    <input id="first_name" type="text" value={data.first_name} onChange={(e) => setData('first_name', e.target.value)} />
                                                    {errors.first_name && <span className="sca-error">{errors.first_name}</span>}
                                                </div>
                                            </div>
                                            <div className="col-md-6">
                                                <div className="sca-field">
                                                    <label htmlFor="last_name">{t('register.personal.last_name')}</label>
                                                    <input id="last_name" type="text" value={data.last_name} onChange={(e) => setData('last_name', e.target.value)} />
                                                    {errors.last_name && <span className="sca-error">{errors.last_name}</span>}
                                                </div>
                                            </div>
                                            <div className="col-md-6">
                                                <div className="sca-field">
                                                    <label htmlFor="email">{t('register.personal.email')}</label>
                                                    <input id="email" type="email" value={data.email} onChange={(e) => setData('email', e.target.value)} />
                                                    {errors.email && <span className="sca-error">{errors.email}</span>}
                                                </div>
                                            </div>
                                            <div className="col-md-6">
                                                <div className="sca-field">
                                                    <label htmlFor="phone">{t('register.personal.phone')}</label>
                                                    <input id="phone" type="tel" value={data.phone} onChange={(e) => setData('phone', e.target.value)} />
                                                    {errors.phone && <span className="sca-error">{errors.phone}</span>}
                                                </div>
                                            </div>
                                            <div className="col-md-6">
                                                <div className="sca-field">
                                                    <label htmlFor="country">{t('register.personal.country')}</label>
                                                    <select id="country" value={data.country} onChange={(e) => setData('country', e.target.value)}>
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
                                )}

                                {step === 1 && (
                                    <div>
                                        <div className="heading4 text-center space-margin60">
                                            <h2>{t('register.pass.title')}</h2>
                                            <div className="space16" />
                                            <p style={{ color: 'rgba(255,255,255,0.75)' }}>{t('register.pass.body')}</p>
                                        </div>
                                        <div className="row" style={{ rowGap: 24 }}>
                                            {tiers.map((tier) => (
                                                <div key={tier.slug} className="col-lg-4">
                                                    <div
                                                        className={`sca-option ${data.ticket_tier === tier.slug ? 'selected' : ''}`}
                                                        onClick={() => setData('ticket_tier', tier.slug)}
                                                        role="radio"
                                                        aria-checked={data.ticket_tier === tier.slug}
                                                        tabIndex={0}
                                                        onKeyDown={(e) => e.key === 'Enter' && setData('ticket_tier', tier.slug)}
                                                    >
                                                        <h3 style={{ color: '#fff', fontSize: 22, fontWeight: 700 }}>{tier.name}</h3>
                                                        {tier.subtitle && <p className="sca-meta">{tier.subtitle}</p>}
                                                        <div className="space12" />
                                                        <span className="sca-price">{formatPrice(tier.priceMinor, t('register.pass.free'))}</span>
                                                        <ul>
                                                            {tier.perks.map((perk) => (
                                                                <li key={perk}>{perk}</li>
                                                            ))}
                                                        </ul>
                                                        {tier.badge && (
                                                            <p style={{ marginTop: 14, color: 'rgba(255,255,255,0.6)', fontStyle: 'italic' }}>{tier.badge}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {step === 2 && (
                                    <div>
                                        <div className="heading4 text-center space-margin60">
                                            <h2>{t('register.hotel.title')}</h2>
                                            <div className="space16" />
                                            <p style={{ color: 'rgba(255,255,255,0.75)' }}>{t('register.hotel.body')}</p>
                                        </div>
                                        <div className="row" style={{ rowGap: 24 }}>
                                            {hotels.map((hotel) => (
                                                <div key={hotel.slug} className="col-lg-3 col-md-6">
                                                    <div
                                                        className={`sca-option ${data.hotel === hotel.slug ? 'selected' : ''}`}
                                                        onClick={() => setData('hotel', hotel.slug)}
                                                        role="radio"
                                                        aria-checked={data.hotel === hotel.slug}
                                                        tabIndex={0}
                                                        onKeyDown={(e) => e.key === 'Enter' && setData('hotel', hotel.slug)}
                                                    >
                                                        <h3 style={{ color: '#fff', fontSize: 19, fontWeight: 700 }}>{hotel.name}</h3>
                                                        {hotel.note && <p className="sca-meta" style={{ marginTop: 8 }}>{hotel.note}</p>}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {step === 3 && (
                                    <div>
                                        <div className="heading4 text-center space-margin60">
                                            <h2>{t('register.addons.title')}</h2>
                                            <div className="space16" />
                                            <p style={{ color: 'rgba(255,255,255,0.75)' }}>{t('register.addons.body')}</p>
                                        </div>
                                        <div className="row" style={{ rowGap: 24 }}>
                                            {addons.map((addon) => (
                                                <div key={addon.slug} className="col-lg-3 col-md-6">
                                                    <div
                                                        className={`sca-option ${data.addons.includes(addon.slug) ? 'selected' : ''}`}
                                                        onClick={() => toggleAddon(addon.slug)}
                                                        role="checkbox"
                                                        aria-checked={data.addons.includes(addon.slug)}
                                                        tabIndex={0}
                                                        onKeyDown={(e) => e.key === 'Enter' && toggleAddon(addon.slug)}
                                                    >
                                                        <h3 style={{ color: '#fff', fontSize: 19, fontWeight: 700 }}>{addon.name}</h3>
                                                        <div className="space12" />
                                                        <span className="sca-price">{formatPrice(addon.priceMinor, t('register.pass.free'))}</span>
                                                    </div>
                                                </div>
                                            ))}
                                            <div className="col-lg-3 col-md-6">
                                                <div
                                                    className={`sca-option ${data.addons.length === 0 ? 'selected' : ''}`}
                                                    onClick={() => setData('addons', [])}
                                                    role="checkbox"
                                                    aria-checked={data.addons.length === 0}
                                                    tabIndex={0}
                                                    onKeyDown={(e) => e.key === 'Enter' && setData('addons', [])}
                                                >
                                                    <h3 style={{ color: '#fff', fontSize: 19, fontWeight: 700 }}>{t('register.addons.none')}</h3>
                                                    <div className="space12" />
                                                    <p>{t('register.addons.none_body')}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {step === 4 && (
                                    <div>
                                        <div className="heading4 text-center space-margin60">
                                            <h2>{t('register.payment.title')}</h2>
                                            <div className="space16" />
                                            <p style={{ color: 'rgba(255,255,255,0.75)' }}>{t('register.payment.body')}</p>
                                        </div>
                                        <div className="row" style={{ rowGap: 24 }}>
                                            <div className="col-lg-6">
                                                <div className="sca-card">
                                                    <h3>{t('register.payment.order_summary')}</h3>
                                                    <div className="space24" />
                                                    {selectedTier && (
                                                        <p style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                            <span>{selectedTier.name}</span>
                                                            <span>{formatPrice(selectedTier.priceMinor, t('register.pass.free'))}</span>
                                                        </p>
                                                    )}
                                                    {selectedAddons.map((addon) => (
                                                        <p key={addon.slug} style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10 }}>
                                                            <span>{addon.name}</span>
                                                            <span>{formatPrice(addon.priceMinor, t('register.pass.free'))}</span>
                                                        </p>
                                                    ))}
                                                    <hr style={{ borderColor: 'rgba(255,255,255,0.2)', margin: '18px 0' }} />
                                                    <p style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, color: '#fff', fontSize: 18 }}>
                                                        <span>{t('register.payment.total')}</span>
                                                        <span className="sca-price">{formatPrice(totalMinor, t('register.pass.free'))}</span>
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="col-lg-6">
                                                <div className="sca-card">
                                                    <h3>{t('register.payment.payment_details')}</h3>
                                                    <div className="space24" />
                                                    <div className="sca-field">
                                                        <label htmlFor="payment_method">{t('register.payment.method')}</label>
                                                        <select
                                                            id="payment_method"
                                                            value={data.payment_method}
                                                            onChange={(e) => setData('payment_method', e.target.value)}
                                                        >
                                                            <option value="credit_card">{t('register.payment.credit_card')}</option>
                                                            <option value="paypal">{t('register.payment.paypal')}</option>
                                                            <option value="bank_transfer">{t('register.payment.bank_transfer')}</option>
                                                        </select>
                                                        {errors.payment_method && <span className="sca-error">{errors.payment_method}</span>}
                                                    </div>
                                                    <p style={{ fontSize: 14 }}>
                                                        <i className="fa-solid fa-lock" style={{ color: '#FF0A9D', marginRight: 8 }} />
                                                        {t('register.payment.secure_note')}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {stepError && !canAdvance() && (
                                    <p className="sca-error" style={{ marginTop: 16, textAlign: 'center' }}>{stepError}</p>
                                )}

                                <div className="space40" />
                                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 14, flexWrap: 'wrap' }}>
                                    <button
                                        type="button"
                                        onClick={previous}
                                        disabled={step === 0}
                                        className="sca-badge"
                                        style={{ border: 'none', cursor: step === 0 ? 'not-allowed' : 'pointer', opacity: step === 0 ? 0.4 : 1, padding: '14px 28px', fontSize: 15 }}
                                    >
                                        {t('register.previous')}
                                    </button>
                                    {step < 4 ? (
                                        <button
                                            type="button"
                                            onClick={next}
                                            className="sca-badge tier-title"
                                            style={{ border: 'none', cursor: 'pointer', padding: '14px 28px', fontSize: 15 }}
                                        >
                                            {step === 0 ? t('register.next_pass') : step === 3 ? t('register.next_pay') : t('register.next')}
                                        </button>
                                    ) : (
                                        <button
                                            type="submit"
                                            disabled={processing}
                                            className="sca-badge tier-title"
                                            style={{ border: 'none', cursor: 'pointer', padding: '14px 28px', fontSize: 15 }}
                                        >
                                            {t('register.complete')}
                                        </button>
                                    )}
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </SiteLayout>
    );
}
