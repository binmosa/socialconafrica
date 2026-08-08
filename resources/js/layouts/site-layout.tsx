import '@/../css/template.css';

import { Head } from '@inertiajs/react';
import { PropsWithChildren, useEffect, useState } from 'react';

import { NewsletterPopup } from '@/components/site/newsletter-popup';
import { Preloader } from '@/components/site/preloader';
import { ScrollProgress } from '@/components/site/scroll-progress';
import { SiteFooter } from '@/components/site/site-footer';
import { SiteHeader } from '@/components/site/site-header';
import { useT } from '@/lib/i18n';

interface SiteLayoutProps {
    meta?: { title?: string; description?: string };
}

export default function SiteLayout({ children, meta }: PropsWithChildren<SiteLayoutProps>) {
    const { t } = useT();
    const [popupOpen, setPopupOpen] = useState(false);

    useEffect(() => {
        const timer = window.setTimeout(() => setPopupOpen(true), 8000);
        return () => window.clearTimeout(timer);
    }, []);

    return (
        <>
            <Head title={meta?.title ?? t('meta.title')}>
                <meta name="description" content={meta?.description ?? t('meta.description')} />
            </Head>

            <NewsletterPopup open={popupOpen} onClose={() => setPopupOpen(false)} />
            <Preloader />
            <ScrollProgress />

            <SiteHeader />

            <main>{children}</main>

            <SiteFooter />
        </>
    );
}
