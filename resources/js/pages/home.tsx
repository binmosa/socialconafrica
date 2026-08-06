import { Carousel } from '@/components/site/carousel';
import { Countdown } from '@/components/site/countdown';
import { EventTabs } from '@/components/site/event-tabs';
import { Reveal } from '@/components/site/reveal';
import { EVENT_DATE, sponsors, speakers, tickets, works } from '@/data/home';
import SiteLayout from '@/layouts/site-layout';
import { useT } from '@/lib/i18n';

const arrowIcon = (
    <span className="arrow">
        <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 26 26" fill="none">
            <path d="M5 21L18 8" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M8 8H19V19" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    </span>
);

const clockIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" width="29" height="28" viewBox="0 0 29 28" fill="none">
        <path
            d="M14.13 24.45c5.77 0 10.45-4.68 10.45-10.45S19.9 3.55 14.13 3.55 3.68 8.23 3.68 14s4.68 10.45 10.45 10.45Z"
            stroke="white"
            strokeWidth="2.79"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <path d="M14.13 8.19v4.37c0 .43.12.85.35 1.22.23.37.55.66.94.86l3.36 1.68" stroke="white" strokeWidth="2.79" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const pinIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" width="29" height="28" viewBox="0 0 29 28" fill="none">
        <path
            d="M14.08 3.55c-2.16 0-4.22.86-5.75 2.38A8.13 8.13 0 0 0 5.96 11.67c0 3.33 2.07 6.53 4.34 9.02 1.16 1.27 2.43 2.43 3.79 3.48.2-.16.44-.35.72-.57 1.08-.9 2.11-1.87 3.06-2.91 2.27-2.49 4.34-5.69 4.34-9.02 0-2.15-.86-4.22-2.38-5.74-1.52-1.52-3.59-2.38-5.75-2.38Zm0 23.47L13.43 26.57l-.03-.02-.07-.06-.02-.02-.09-.06-.31-.23c-1.59-1.19-3.07-2.53-4.41-3.99-2.37-2.6-4.95-6.36-4.95-10.58 0-2.77 1.1-5.43 3.06-7.39C8.57 2.32 11.23 1.22 14.08 1.22c2.86 0 5.52 1.1 7.48 3.06 1.96 1.96 3.06 4.62 3.06 7.39 0 4.22-2.58 7.98-4.95 10.58-1.34 1.46-2.82 2.8-4.41 3.99a67.44 67.44 0 0 1-.63.48l-.03.02-.66.44Zm0-17.67c-.62 0-1.21.24-1.64.68-.43.44-.68 1.03-.68 1.64 0 .62.24 1.21.68 1.64.44.44 1.03.68 1.64.68.62 0 1.21-.24 1.64-.68.43-.44.68-1.03.68-1.64 0-.62-.24-1.21-.68-1.64a2.32 2.32 0 0 0-1.64-.68Z"
            fill="white"
        />
    </svg>
);

interface HomeProps {
    meta?: { title?: string; description?: string };
}

export default function Home({ meta }: HomeProps) {
    const { t } = useT();

    const scheduleTabs = [
        { key: 'day1', day: t('schedule.day_one'), date: t('schedule.date') },
        { key: 'day2', day: t('schedule.day_two'), date: t('schedule.date') },
        { key: 'day3', day: t('schedule.day_three'), date: t('schedule.date') },
        { key: 'day4', day: t('schedule.day_four'), date: t('schedule.date') },
    ];

    const renderSchedulePanel = () => (
        <div className="service-event4-boxarea">
            <div className="img1">
                <img src="/template/img/all-images/service/service-img7.png" alt="" loading="lazy" />
            </div>
            <div className="space32" />
            <ul>
                <li>
                    <a href="#">
                        {clockIcon} {t('schedule.session_time')} <span> | </span>
                    </a>
                </li>
                <li>
                    <a href="#">
                        {pinIcon} {t('schedule.session_place')}
                    </a>
                </li>
            </ul>
            <div className="space28" />
            <a href="#" className="author">
                {t('schedule.session_title')}
            </a>
            <div className="space32" />
            <div className="btn-area1">
                <a href="#tickets" className="vl-btn4">
                    <span className="text">{t('schedule.cta')}</span>
                    {arrowIcon}
                </a>
                <img src="/template/img/all-images/others/others-img2.png" alt="" loading="lazy" />
            </div>
        </div>
    );

    return (
        <SiteLayout meta={meta}>
            {/* Hero */}
            <div
                className="hero4-section-area"
                style={{
                    backgroundImage: 'url(/template/img/all-images/bg/hero-bg3.png)',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: 'cover',
                }}
            >
                <div className="container">
                    <div className="row">
                        <div className="col-lg-12">
                            <div className="hero4-heading">
                                <Reveal direction="left" as="h5">
                                    <img src="/template/img/icons/sub-logo3.svg" alt="" /> {t('hero.eyebrow')}
                                </Reveal>
                                <div className="space36" />
                                <Reveal direction="up" as="h1">
                                    {t('hero.title_1')} <span>{t('hero.title_2')}</span>
                                </Reveal>
                            </div>
                        </div>
                    </div>
                    <div className="space70" />
                    <div className="row">
                        <div className="col-lg-9">
                            <div className="images-area">
                                <img src="/template/img/elements/elements23.png" alt="" className="elements23 keyframe5" />
                                <div className="img1">
                                    <img src="/template/img/all-images/hero/hero-img6.png" alt="" />
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-3">
                            <div className="date-btn">
                                <a href="#">{t('hero.date')}</a>
                            </div>
                            <div className="space30" />
                            <Countdown target={EVENT_DATE} />
                        </div>
                    </div>
                </div>
            </div>

            <div
                className="bg-area4"
                style={{
                    backgroundImage: 'url(/template/img/all-images/bg/bg4.png)',
                    backgroundPosition: 'center top',
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: 'cover',
                }}
            >
                {/* About */}
                <div id="about" className="about4-section-area">
                    <img src="/template/img/elements/elements24.png" alt="" className="elements24" />
                    <div className="container">
                        <div className="row align-items-center">
                            <div className="col-lg-6">
                                <div className="about-images-area">
                                    <div className="row">
                                        <div className="col-lg-6 col-md-6">
                                            <div className="author-img">
                                                <img src="/template/img/elements/elements25.png" alt="" loading="lazy" />
                                            </div>
                                            <div className="space40" />
                                            <div className="img1">
                                                <img src="/template/img/all-images/about/about-img4.png" alt="" loading="lazy" />
                                            </div>
                                        </div>
                                        <div className="col-lg-6 col-md-6">
                                            <div className="space30 d-md-none d-block" />
                                            <div className="img1">
                                                <img src="/template/img/all-images/about/about-img5.png" alt="" loading="lazy" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="col-lg-6">
                                <div className="about-main-content heading4">
                                    <Reveal direction="left" as="h5">
                                        <img src="/template/img/icons/sub-logo3.svg" alt="" /> {t('about.eyebrow')}
                                    </Reveal>
                                    <div className="space20" />
                                    <Reveal direction="up" as="h2">
                                        {t('about.title')}
                                    </Reveal>
                                    <div className="space18" />
                                    <Reveal direction="left" as="p">
                                        {t('about.body')}
                                    </Reveal>
                                    <div className="space30" />
                                    <div className="row">
                                        <div className="col-lg-5 col-md-6">
                                            <div className="about-box">
                                                <h3>{t('about.stat_1')}</h3>
                                            </div>
                                        </div>
                                        <div className="col-lg-5 col-md-6">
                                            <div className="about-box">
                                                <h3>{t('about.stat_2')}</h3>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space32" />
                                    <div className="btn-area1">
                                        <a href="#tickets" className="vl-btn4">
                                            <span className="text">{t('about.cta')}</span>
                                            {arrowIcon}
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sponsors */}
                <div className="brand4-section-area sp4">
                    <div className="container">
                        <div className="row">
                            <div className="col-lg-6 m-auto">
                                <div className="heading4 text-center space-margin60">
                                    <h5>
                                        <img src="/template/img/icons/sub-logo3.svg" alt="" /> {t('sponsors.eyebrow')}
                                    </h5>
                                </div>
                            </div>
                        </div>
                        <Carousel slideBasis="16.66%" gap={32} loop autoplayMs={3000} align="start">
                            {sponsors.map((src, i) => (
                                <div className="brand-boxarea" key={i}>
                                    <img src={src} alt="" loading="lazy" />
                                </div>
                            ))}
                        </Carousel>
                    </div>
                </div>

                {/* Speakers */}
                <div className="team4-section-area sp6">
                    <div className="container">
                        <div className="row">
                            <div className="col-lg-7">
                                <div className="team-heading heading4 space-margin60">
                                    <h5>
                                        <img src="/template/img/icons/sub-logo3.svg" alt="" /> {t('speakers.eyebrow')}
                                    </h5>
                                    <div className="space20" />
                                    <Reveal direction="up" as="h2">
                                        {t('speakers.title')}
                                    </Reveal>
                                </div>
                            </div>
                        </div>
                        <Carousel slideBasis="25%" gap={30} loop align="start">
                            {speakers.map((speaker, i) => (
                                <div key={i} className="team-single-boxarea">
                                    <div className="img1">
                                        <img src={speaker.image} alt={speaker.name} loading="lazy" />
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
                            ))}
                        </Carousel>
                    </div>
                </div>

                {/* Schedule */}
                <div
                    id="schedule"
                    className="event-service5-section-area sp6"
                    style={{
                        backgroundImage: 'url(/template/img/all-images/bg/bg5.png)',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat',
                        backgroundSize: 'cover',
                    }}
                >
                    <div className="container">
                        <div className="row">
                            <div className="col-lg-7 m-auto">
                                <div className="heading4 text-center space-margin60">
                                    <h5>
                                        <img src="/template/img/icons/sub-logo3.svg" alt="" /> {t('schedule.eyebrow')}
                                    </h5>
                                    <div className="space20" />
                                    <Reveal direction="up" as="h2">
                                        {t('schedule.title')}
                                    </Reveal>
                                </div>
                            </div>
                        </div>
                        <EventTabs tabs={scheduleTabs} renderPanel={renderSchedulePanel} />
                    </div>
                </div>

                {/* Tickets */}
                <div id="tickets" className="others-ticket-area sp6">
                    <div className="container">
                        <div className="row align-items-center">
                            <div className="col-lg-6">
                                <div className="heading4">
                                    <Reveal direction="left" as="h5">
                                        <img src="/template/img/icons/sub-logo3.svg" alt="" /> {t('tickets.eyebrow')}
                                    </Reveal>
                                    <div className="space20" />
                                    <Reveal direction="up" as="h2">
                                        {t('tickets.title')}
                                    </Reveal>
                                    <div className="space18" />
                                    <Reveal direction="left" as="p">
                                        {t('tickets.body')}
                                    </Reveal>
                                    <div className="space32" />
                                    <div className="btn-area1">
                                        <a href="#" className="vl-btn4">
                                            <span className="text">{t('tickets.cta')}</span>
                                            {arrowIcon}
                                        </a>
                                    </div>
                                </div>
                            </div>
                            <div className="col-lg-6">
                                <div
                                    className="bg-progress"
                                    style={{
                                        backgroundImage: 'url(/template/img/all-images/bg/bg6.png)',
                                        backgroundPosition: 'center',
                                        backgroundRepeat: 'no-repeat',
                                        backgroundSize: 'cover',
                                    }}
                                >
                                    {tickets.map((ticket, i) => {
                                        const pct = Math.round((ticket.sold / ticket.total) * 100);
                                        return (
                                            <div
                                                className="progress-bar"
                                                key={ticket.tierKey}
                                                style={i === tickets.length - 1 ? { margin: 0 } : undefined}
                                            >
                                                <label>
                                                    <span>
                                                        {t(`tickets.${ticket.tierKey}`)}: <span>{ticket.price}</span>
                                                    </span>
                                                    <span>
                                                        {ticket.sold}/{ticket.total}
                                                    </span>
                                                </label>
                                                <div className="progress">
                                                    <div className="progress-inner" style={{ width: `${pct}%` }} />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Works */}
                <div
                    className="wprk4-section-area sp6"
                    style={{
                        backgroundImage: 'url(/template/img/all-images/bg/bg6.png)',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat',
                        backgroundSize: 'cover',
                    }}
                >
                    <div className="container">
                        <div className="row">
                            <div className="col-lg-6">
                                <div className="heading4 space-margin60">
                                    <h5>
                                        <img src="/template/img/icons/sub-logo3.svg" alt="" /> {t('works.eyebrow')}
                                    </h5>
                                    <div className="space20" />
                                    <Reveal direction="up" as="h2">
                                        {t('works.title')}
                                    </Reveal>
                                </div>
                            </div>
                        </div>
                        <Carousel slideBasis="33.33%" gap={24} loop autoplayMs={4000}>
                            {works.map((work, i) => (
                                <div key={i} className="work-single-boxarea">
                                    <div className="img1">
                                        <img src={work.image} alt={work.name} loading="lazy" />
                                    </div>
                                    <div className="content-area">
                                        <p>{t('works.event_year')}</p>
                                        <div className="space12" />
                                        <a href="#">{t('works.name')}</a>
                                        <div className="plus">
                                            <a href="#" aria-label="Details"><i className="fa-solid fa-plus" /></a>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </Carousel>
                    </div>
                </div>

                {/* CTA */}
                <div className="cta4-section-area sp6">
                    <div className="container">
                        <div className="row align-items-center">
                            <div className="col-lg-9">
                                <div className="cta-heading1">
                                    <Reveal direction="left" as="h5">
                                        <img src="/template/img/icons/sub-logo4.svg" alt="" /> {t('cta.eyebrow')}
                                    </Reveal>
                                    <div className="space48" />
                                    <Reveal direction="up" as="h2">
                                        {t('cta.title_1')} <span>{t('cta.title_2')}</span>
                                    </Reveal>
                                </div>
                            </div>
                            <div className="col-lg-2">
                                <div className="arrow-cta-btn">
                                    <a href="#tickets" aria-label={t('cta.title_1')}>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 80 80" fill="none">
                                            <path d="M40 12.5V67.5" stroke="white" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
                                            <path d="M17.5 45L40 67.5L62.5 45" stroke="white" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </SiteLayout>
    );
}
