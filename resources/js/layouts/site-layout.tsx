import '@/../css/template.css';

import { Head } from '@inertiajs/react';
import { PropsWithChildren, useEffect, useState } from 'react';

const TEMPLATE_CSS = [
    '/template/css/plugins/bootstrap.min.css',
    '/template/css/plugins/aos.css',
    '/template/css/plugins/fontawesome.css',
    '/template/css/plugins/magnific-popup.css',
    '/template/css/plugins/owlcarousel.min.css',
    '/template/css/plugins/sidebar.css',
    '/template/css/plugins/slick-slider.css',
    '/template/css/plugins/nice-select.css',
    '/template/css/main.css',
];

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
                {TEMPLATE_CSS.map((href) => (
                    <link rel="stylesheet" href={href} key={href} />
                ))}
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
