import { useForm, usePage } from '@inertiajs/react';
import { FormEvent } from 'react';

import { InnerPageHeader } from '@/components/site/inner-page-header';
import SiteLayout from '@/layouts/site-layout';
import { useT } from '@/lib/i18n';

interface ContactProps {
    meta?: { title?: string };
    contact: {
        email: string;
        phone: string;
        address: string;
        linkedin: string;
        handle: string;
    };
}

export default function Contact({ meta, contact }: ContactProps) {
    const { t, locale } = useT();
    const { flash } = usePage().props as unknown as { flash?: { success?: string } };

    const { data, setData, post, processing, errors, reset } = useForm({
        first_name: '',
        last_name: '',
        email: '',
        message: '',
    });

    const submit = (e: FormEvent) => {
        e.preventDefault();
        post(`/${locale}/contact`, {
            preserveScroll: true,
            onSuccess: () => reset(),
        });
    };

    return (
        <SiteLayout meta={meta}>
            <InnerPageHeader title={t('contact.title')} subtitle={t('contact.subtitle')} />

            <div
                className="bg-area4 sp6"
                style={{
                    backgroundImage: 'url(/template/img/all-images/bg/bg4.png)',
                    backgroundPosition: 'center top',
                    backgroundSize: 'cover',
                }}
            >
                <div className="container">
                    <div className="row" style={{ rowGap: 30 }}>
                        <div className="col-lg-7">
                            <div className="sca-card">
                                {flash?.success && (
                                    <div
                                        role="status"
                                        style={{
                                            background: 'rgba(91,160,84,0.2)',
                                            border: '1px solid rgba(91,160,84,0.6)',
                                            borderRadius: 12,
                                            padding: '14px 18px',
                                            color: '#fff',
                                            marginBottom: 22,
                                        }}
                                    >
                                        {flash.success}
                                    </div>
                                )}
                                <form onSubmit={submit} className="sca-form">
                                    <div className="row">
                                        <div className="col-md-6">
                                            <div className="sca-field">
                                                <label htmlFor="first_name">{t('contact.first_name')}</label>
                                                <input
                                                    id="first_name"
                                                    type="text"
                                                    value={data.first_name}
                                                    onChange={(e) => setData('first_name', e.target.value)}
                                                    required
                                                />
                                                {errors.first_name && <span className="sca-error">{errors.first_name}</span>}
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="sca-field">
                                                <label htmlFor="last_name">{t('contact.last_name')}</label>
                                                <input
                                                    id="last_name"
                                                    type="text"
                                                    value={data.last_name}
                                                    onChange={(e) => setData('last_name', e.target.value)}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="sca-field">
                                        <label htmlFor="email">{t('contact.email')}</label>
                                        <input
                                            id="email"
                                            type="email"
                                            value={data.email}
                                            onChange={(e) => setData('email', e.target.value)}
                                            required
                                        />
                                        {errors.email && <span className="sca-error">{errors.email}</span>}
                                    </div>
                                    <div className="sca-field">
                                        <label htmlFor="message">{t('contact.message')}</label>
                                        <textarea
                                            id="message"
                                            rows={6}
                                            value={data.message}
                                            onChange={(e) => setData('message', e.target.value)}
                                            required
                                        />
                                        {errors.message && <span className="sca-error">{errors.message}</span>}
                                    </div>
                                    <div className="btn-area1">
                                        <button type="submit" className="vl-btn4" disabled={processing} style={{ border: 'none', background: 'transparent' }}>
                                            <span className="text">{t('contact.send')}</span>
                                            <span className="arrow">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 26 26" fill="none">
                                                    <path d="M5 21L18 8" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                    <path d="M8 8H19V19" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                </svg>
                                            </span>
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                        <div className="col-lg-5">
                            <div className="sca-card">
                                <h3>{t('contact.info_title')}</h3>
                                <div className="space24" />
                                <p>
                                    <i className="fa-regular fa-envelope" style={{ color: '#FF0A9D', marginRight: 10 }} />
                                    <a href={`mailto:${contact.email}`} style={{ color: '#fff' }}>{contact.email}</a>
                                </p>
                                <div className="space16" />
                                <p>
                                    <i className="fa-solid fa-phone" style={{ color: '#FF0A9D', marginRight: 10 }} />
                                    <a href={`tel:${contact.phone.replace(/\s+/g, '')}`} style={{ color: '#fff' }}>{contact.phone}</a>
                                </p>
                                <div className="space16" />
                                <p>
                                    <i className="fa-solid fa-location-dot" style={{ color: '#FF0A9D', marginRight: 10 }} />
                                    {contact.address}
                                </p>
                                <div className="space32" />
                                <h3>{t('contact.follow_title')}</h3>
                                <div className="space16" />
                                <p>
                                    <i className="fa-brands fa-linkedin-in" style={{ color: '#FF0A9D', marginRight: 10 }} />
                                    <a href={contact.linkedin} target="_blank" rel="noreferrer" style={{ color: '#fff' }}>
                                        /socialcon-africa
                                    </a>
                                </p>
                                <div className="space12" />
                                <p>
                                    <i className="fa-brands fa-x-twitter" style={{ color: '#FF0A9D', marginRight: 10 }} />
                                    {contact.handle}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </SiteLayout>
    );
}
