import { Link } from '@inertiajs/react';
import { CSSProperties, useRef, useState } from 'react';

import { Carousel } from '@/components/site/carousel';
import { Countdown } from '@/components/site/countdown';
import { CountUp } from '@/components/site/count-up';
import { Reveal } from '@/components/site/reveal';
import { SectionEyebrow } from '@/components/site/section-eyebrow';
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

const ACCENTS = ['var(--sca-green)', 'var(--sca-yellow)', 'var(--sca-red)', 'var(--sca-blue)'];

/* Each pass class owns one logo color — the whole ticket recolors on selection. */
const FARE_ACCENTS: Record<string, string> = {
    'friday-free': 'var(--sca-green)',
    creator: 'var(--sca-yellow)',
    vip: 'var(--sca-blue)',
};

const TIER_ACCENTS: Record<string, string> = {
    title: 'var(--sca-pink)',
    platinum: '#7C5CB8',
    gold: 'var(--sca-yellow)',
    supporting: 'var(--sca-green)',
};

const PLATFORMS = [
    { icon: 'fa-brands fa-tiktok', name: 'TikTok' },
    { icon: 'fa-brands fa-instagram', name: 'Instagram' },
    { icon: 'fa-brands fa-youtube', name: 'YouTube' },
    { icon: 'fa-brands fa-x-twitter', name: 'X' },
    { icon: 'fa-brands fa-facebook', name: 'Facebook' },
    { icon: 'fa-brands fa-linkedin', name: 'LinkedIn' },
];

interface SpeakerProp {
    name: string;
    role: string;
    photo: string | null;
    category: string;
}

interface LeaderProp {
    name: string;
    title: string;
    quote: string;
    photo: string | null;
}

interface PersonaProp {
    title: string;
    description: string;
    icon: string | null;
}

interface TestimonialProp {
    author: string;
    role: string;
    country: string;
    quote: string;
}

interface SponsorProp {
    name: string;
    tier: { slug: string; name: string };
    description: string | null;
    url: string | null;
    logo: string | null;
}

interface TierProp {
    slug: string;
    name: string;
    subtitle: string | null;
    priceMinor: number;
    perks: string[];
    badge: string | null;
}

interface HomeProps {
    meta?: { title?: string; description?: string };
    eventDate: string;
    speakers: SpeakerProp[];
    leaders: LeaderProp[];
    personas: PersonaProp[];
    testimonials: TestimonialProp[];
    sponsors: SponsorProp[];
    tiers: TierProp[];
}

function initials(name: string): string {
    const words = name.split(/\s+/).filter((word) => /^\p{Lu}/u.test(word) && word.length > 2);
    const picked = words.length >= 2 ? words.slice(-2) : name.split(/\s+/).slice(-2);
    return picked.map((word) => word[0]).join('').toUpperCase();
}

export default function Home({ meta, eventDate, speakers, leaders, personas, testimonials, sponsors, tiers }: HomeProps) {
    const { t, locale } = useT();
    const videoRef = useRef<HTMLVideoElement>(null);
    const [videoMuted, setVideoMuted] = useState(true);
    const [fareSlug, setFareSlug] = useState<string>(tiers[1]?.slug ?? tiers[0]?.slug ?? '');

    const fare = tiers.find((tier) => tier.slug === fareSlug) ?? tiers[0];

    const formatFare = (minor: number) => (minor === 0 ? t('home.tickets.free') : `$${(minor / 100).toLocaleString('en-US', { maximumFractionDigits: 2 })}`);

    const toggleVideoSound = () => {
        const video = videoRef.current;
        if (!video) return;
        video.muted = !video.muted;
        setVideoMuted(video.muted);
        if (video.paused) {
            void video.play();
        }
    };

    const numbers = [0, 1, 2, 3].map((i) => ({
        value: t(`home.numbers.items.${i}.value`),
        label: t(`home.numbers.items.${i}.label`),
    }));

    const factAccents = ['', 'box2', 'box3', 'box5'];

    const marqueeTags = ['#SocialConAfrica2026', '#AfricanInfluencerAwards', 'Addis Ababa', t('hero.date'), t('hero.title_1') + ' ' + t('hero.title_2')];

    return (
        <SiteLayout meta={meta}>
            {/* Hero v2 — giant type, info chips, framed promo video in the brand-device shell */}
            <div className="sca-hero2">
                <img src="/template/img/elements/elements23.png" alt="" className="sca-hero2-flower keyframe5" />
                <div className="container">
                    <Reveal direction="up" as="h1">
                        <img src="/image/logo-full.png" alt={`${t('hero.title_1')} ${t('hero.title_2')}`} className="sca-hero2-logo" />
                    </Reveal>
                    <div className="sca-hero2-chips">
                        <span className="sca-chip" style={{ '--sca-accent': 'var(--sca-red)' } as CSSProperties}>
                            <i className="fa-regular fa-calendar" /> {t('hero.date')}
                        </span>
                        <span className="sca-chip" style={{ '--sca-accent': 'var(--sca-blue)' } as CSSProperties}>
                            <i className="fa-solid fa-location-dot" /> {t('header.address')}
                        </span>
                        <span className="sca-chip d-none d-md-inline-flex" style={{ '--sca-accent': 'var(--sca-yellow)' } as CSSProperties}>
                            <i className="fa-solid fa-satellite-dish" /> {t('hero.eyebrow')}
                        </span>
                    </div>
                    <div className="sca-hero2-grid">
                        <div className="sca-hero2-left">
                            <Reveal direction="up" as="h2">
                                <span className="sca-hero2-sub">{t('hero.subtitle')}</span>
                            </Reveal>
                            <div>
                                <a href="#tickets" className="sca-ticket">
                                    <span className="sca-ticket-cta">
                                        {t('nav.buy_ticket')} <i className="fa-solid fa-ticket" aria-hidden="true" />
                                    </span>
                                    <span className="sca-ticket-year" aria-hidden="true">
                                        <span>20</span>
                                        <span>26</span>
                                    </span>
                                </a>
                                <div className="space16" />
                                <a href="#about" style={{ color: 'rgba(255,255,255,0.75)', fontWeight: 600 }}>
                                    {t('common.learn_more')} <i className="fa-solid fa-arrow-down" style={{ marginLeft: 6, fontSize: 12 }} />
                                </a>
                            </div>
                            <div className="sca-dials-compact">
                                <Countdown target={new Date(eventDate)} />
                            </div>
                        </div>
                        <Reveal direction="up" as="div">
                            <div className="sca-video-frame">
                                <video
                                    ref={videoRef}
                                    src="/videos/hero.mp4"
                                    poster="/template/img/all-images/bg/hero-bg3.png"
                                    autoPlay
                                    muted
                                    loop
                                    playsInline
                                />
                                <span className="sca-video-chip">
                                    <span className="sca-live-dot" aria-hidden="true" /> SocialCon Africa 2025
                                </span>
                                <button
                                    type="button"
                                    className="sca-mute-btn"
                                    onClick={toggleVideoSound}
                                    aria-label={videoMuted ? 'Unmute video' : 'Mute video'}
                                >
                                    <i className={videoMuted ? 'fa-solid fa-volume-xmark' : 'fa-solid fa-volume-high'} />
                                </button>
                            </div>
                        </Reveal>
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
                {/* Featured platforms — dual counter-scrolling marquee strips */}
                <div className="slider2-section-area sp4" style={{ position: 'relative', zIndex: 1 }}>
                    <div className="container">
                        <div className="row">
                            <div className="col-lg-8 m-auto">
                                <div className="heading4 text-center space-margin60">
                                    <SectionEyebrow label={t('home.platforms.eyebrow')} icon="fa-solid fa-hashtag" accent="var(--sca-blue)" />
                                    <div className="space20" />
                                    <p style={{ color: 'rgba(255,255,255,0.75)' }}>{t('home.platforms.body')}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="marquee-wrap">
                        <div className="marquee-text">
                            {[0, 1, 2, 3].flatMap((pass) =>
                                PLATFORMS.map((platform) => (
                                    <div key={`${pass}-${platform.name}`} className="brand-single-box">
                                        <h3>
                                            <i className={platform.icon} aria-hidden="true" /> {platform.name}
                                        </h3>
                                    </div>
                                )),
                            )}
                        </div>
                    </div>
                    <div className="marquee-wrap sca-marquee-alt">
                        <div className="marquee-text">
                            {[0, 1, 2, 3, 4, 5].flatMap((pass) =>
                                marqueeTags.map((tag, i) => (
                                    <div key={`${pass}-${tag}`} className="brand-single-box">
                                        <h3>
                                            <span style={{ color: ACCENTS[i % ACCENTS.length], marginRight: 14 }}>✦</span> {tag}
                                        </h3>
                                    </div>
                                )),
                            )}
                        </div>
                    </div>
                </div>

                {/* About */}
                <div id="about" className="about4-section-area">
                    <img src="/template/img/elements/elements24.png" alt="" className="elements24" />
                    <div className="container">
                        <div className="row align-items-center">
                            <div className="col-lg-6">
                                <div className="sca-collage">
                                    <img src="/template/img/elements/elements23.png" alt="" className="sca-collage-flower keyframe5" />
                                    <div className="sca-collage-a">
                                        <img src="/template/img/all-images/about/about-img4.png" alt="" loading="lazy" />
                                    </div>
                                    <div className="sca-collage-b">
                                        <img src="/template/img/all-images/about/about-img5.png" alt="" loading="lazy" />
                                    </div>
                                    <img src="/template/img/elements/elements7.png" alt="" className="sca-collage-ring keyframe5" />
                                    <div className="sca-collage-chip chip-a aniamtion-key-1">
                                        <span className="sca-chip" style={{ '--sca-accent': 'var(--sca-red)' } as CSSProperties}>
                                            <i className="fa-regular fa-calendar" /> {t('hero.date')}
                                        </span>
                                    </div>
                                    <div className="sca-collage-chip chip-b aniamtion-key-4">
                                        <span className="sca-chip" style={{ '--sca-accent': 'var(--sca-green)' } as CSSProperties}>
                                            <i className="fa-solid fa-location-dot" /> {t('header.address')}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="col-lg-6">
                                <div className="about-main-content heading4">
                                    <Reveal direction="left" as="div">
                                        <SectionEyebrow label={t('about.eyebrow')} icon="fa-solid fa-circle-info" accent="var(--sca-green)" />
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
                                        <Link href={`/${locale}/register`} className="vl-btn4">
                                            <span className="text">{t('common.register_now')}</span>
                                            {arrowIcon}
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Leaders' messages — light band, large capsule portraits */}
                <div className="sp6 sca-section">
                    <div className="container">
                        <div className="sca-leaders-light">
                            <div className="row">
                                <div className="col-lg-8 m-auto">
                                    <div className="heading4 text-center space-margin60">
                                        <SectionEyebrow label={t('home.leaders.eyebrow')} icon="fa-solid fa-crown" accent="var(--sca-yellow)" />
                                        <div className="space20" />
                                        <p className="sca-leaders-lead">{t('home.leaders.body')}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="row" style={{ rowGap: 26 }}>
                                {leaders.map((leader, i) => (
                                    <div key={leader.name} className="col-lg-6">
                                        <div
                                            className="sca-leader-panel"
                                            style={{ '--sca-accent': i % 2 === 0 ? 'var(--sca-green)' : 'var(--sca-blue)' } as CSSProperties}
                                        >
                                            <div className="sca-leader-photo">
                                                {leader.photo ? (
                                                    <img src={leader.photo} alt={leader.name} />
                                                ) : (
                                                    <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: 40, fontWeight: 800, color: '#11082b' }}>
                                                        {initials(leader.name)}
                                                    </span>
                                                )}
                                            </div>
                                            <div>
                                                <span className="sca-quote-mark">&ldquo;</span>
                                                <p>{leader.quote}</p>
                                                <div className="space24" />
                                                <h4>{leader.name}</h4>
                                                <span className="sca-meta">{leader.title}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* In numbers — index3 fact cells + giant outline year + count-up */}
                <div className="face-section-area sp4 sca-section">
                    <h3 className="sca-bg-text" aria-hidden="true">2026</h3>
                    <div className="container">
                        <div className="row">
                            <div className="col-lg-8 m-auto">
                                <div className="heading4 text-center space-margin60">
                                    <SectionEyebrow label={t('home.numbers.eyebrow')} icon="fa-solid fa-chart-simple" accent="var(--sca-red)" />
                                    <div className="space20" />
                                    <Reveal direction="up" as="h2">
                                        <span className="sca-grad">{t('home.numbers.title')}</span>
                                    </Reveal>
                                    <div className="space18" />
                                    <p style={{ color: 'rgba(255,255,255,0.75)' }}>{t('home.numbers.body')}</p>
                                </div>
                            </div>
                        </div>
                        <div className="fact-boxarea">
                            <div className="row">
                                {numbers.map((stat, i) => (
                                    <div key={stat.label} className="col-lg col-md-6 col-6">
                                        <div className={`fact-single-box ${factAccents[i]}`}>
                                            <h2>
                                                <CountUp value={stat.value} />
                                            </h2>
                                            <div className="space16" />
                                            <p>{stat.label}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Featured speakers */}
                <div className="team4-section-area sp6">
                    <div className="container">
                        <div className="row">
                            <div className="col-lg-7">
                                <div className="team-heading heading4 space-margin60">
                                    <SectionEyebrow label={t('speakers.eyebrow')} icon="fa-solid fa-microphone" accent="var(--sca-pink)" />
                                    <div className="space20" />
                                    <Reveal direction="up" as="h2">
                                        {t('speakers.title')}
                                    </Reveal>
                                    <div className="space18" />
                                    <p style={{ color: 'rgba(255,255,255,0.75)' }}>{t('speakers.body')}</p>
                                </div>
                            </div>
                        </div>
                        <Carousel className="team-widget-slider" slideBasis="25%" gap={30} loop align="start">
                            {speakers.map((speaker, i) => (
                                <div key={i} className="team-single-boxarea">
                                    <div className="img1">
                                        <img src={speaker.photo ?? '/template/img/all-images/team/team-img6.png'} alt={speaker.name} loading="lazy" />
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
                        <div className="space48" />
                        <div className="text-center">
                            <div className="btn-area1" style={{ display: 'inline-block' }}>
                                <Link href={`/${locale}/speakers`} className="vl-btn4">
                                    <span className="text">{t('nav.speakers')}</span>
                                    {arrowIcon}
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Who should attend */}
                <div className="sp6 sca-section">
                    <img
                        src="/template/img/elements/elements33.png"
                        alt=""
                        className="aniamtion-key-1"
                        style={{ position: 'absolute', left: -80, top: 60, zIndex: -1, opacity: 0.55, maxWidth: 320 }}
                    />
                    <div className="container">
                        <div className="row">
                            <div className="col-lg-8 m-auto">
                                <div className="heading4 text-center space-margin60">
                                    <SectionEyebrow label={t('home.attend.eyebrow')} icon="fa-solid fa-users" accent="var(--sca-blue)" />
                                    <div className="space20" />
                                    <p style={{ color: 'rgba(255,255,255,0.75)' }}>{t('home.attend.body')}</p>
                                </div>
                            </div>
                        </div>
                        <div className="row" style={{ rowGap: 24 }}>
                            {personas.map((persona, i) => (
                                <div key={persona.title} className="col-lg-4 col-md-6">
                                    <div
                                        className="sca-card sca-persona text-center"
                                        style={{ '--sca-accent': ACCENTS[i % ACCENTS.length] } as CSSProperties}
                                    >
                                        <span className="sca-index" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
                                        <div className="sca-ring">
                                            <img src="/template/img/elements/elements29.png" alt="" className="sca-ring-shape" />
                                            <span className="sca-ring-inner">
                                                <i className={persona.icon ?? 'fa-solid fa-user'} />
                                            </span>
                                        </div>
                                        <h3>{persona.title}</h3>
                                        <p>{persona.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Get your ticket — boarding-pass widget (index2 concept) */}
                <div id="tickets" className="sp6 sca-section">
                    <div className="container">
                        <div className="row">
                            <div className="col-lg-8 m-auto">
                                <div className="heading4 text-center space-margin60">
                                    <SectionEyebrow label={t('home.tickets.eyebrow')} icon="fa-solid fa-ticket" accent="var(--sca-red)" />
                                    <div className="space20" />
                                    <Reveal direction="up" as="h2">
                                        {t('home.tickets.title')}
                                    </Reveal>
                                    <div className="space18" />
                                    <p style={{ color: 'rgba(255,255,255,0.75)' }}>{t('home.tickets.body')}</p>
                                </div>
                            </div>
                        </div>
                        {fare && (
                            <Reveal direction="up" as="div">
                                <div
                                    className="sca-boarding"
                                    style={{ '--fare-accent': FARE_ACCENTS[fare.slug] ?? 'var(--sca-yellow)' } as CSSProperties}
                                >
                                    <div className="sca-boarding-rail">
                                        <span>SocialCon Africa • 2026</span>
                                    </div>
                                    <div className="sca-boarding-main">
                                        <div className="sca-fare-tabs" role="tablist">
                                            <span className="sca-fare-number">#SCA-2026</span>
                                            {tiers.map((tier) => (
                                                <button
                                                    key={tier.slug}
                                                    type="button"
                                                    role="tab"
                                                    aria-selected={tier.slug === fareSlug}
                                                    className={tier.slug === fareSlug ? 'active' : ''}
                                                    onClick={() => setFareSlug(tier.slug)}
                                                >
                                                    {formatFare(tier.priceMinor)}
                                                </button>
                                            ))}
                                        </div>
                                        <div className="space32" />
                                        <h2>
                                            {fare.name} <span>&ldquo;2026&rdquo;</span>
                                        </h2>
                                        {fare.subtitle && (
                                            <>
                                                <div className="space16" />
                                                <p className="sca-fare-sub">
                                                    {fare.subtitle}
                                                    {fare.badge ? ` — ${fare.badge}` : ''}
                                                </p>
                                            </>
                                        )}
                                        <div className="space32" />
                                        <div className="row" style={{ rowGap: 22 }}>
                                            <div className="col-md-7">
                                                <h4 style={{ color: 'rgba(255,255,255,0.65)', fontSize: 14, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 14 }}>
                                                    {t('home.tickets.includes')}
                                                </h4>
                                                <ul className="sca-perk-list">
                                                    {fare.perks.map((perk) => (
                                                        <li key={perk}>{perk}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                            <div className="col-md-5">
                                                <div className="sca-fare-price">
                                                    <h4>{t('home.tickets.price_label')}</h4>
                                                    <h3>
                                                        {formatFare(fare.priceMinor)}
                                                        {fare.priceMinor > 0 && <small> USD</small>}
                                                    </h3>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="sca-boarding-stub">
                                        <span className="sca-stub-number">#SCA-2026</span>
                                        <span className="sca-stub-qr">
                                            <img src="/template/img/elements/elements20.png" alt="" loading="lazy" />
                                        </span>
                                        <Link href={`/${locale}/register?tier=${fare.slug}`} className="sca-stub-buy">
                                            {t('nav.buy_ticket')} <i className="fa-solid fa-arrow-up-right-from-square" aria-hidden="true" />
                                        </Link>
                                    </div>
                                </div>
                            </Reveal>
                        )}
                    </div>
                </div>

                {/* Testimonials */}
                <div
                    className="sp6 sca-section"
                    style={{
                        backgroundImage: 'url(/template/img/all-images/bg/bg5.png)',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat',
                        backgroundSize: 'cover',
                    }}
                >
                    <img
                        src="/template/img/elements/elements30.png"
                        alt=""
                        className="aniamtion-key-4"
                        style={{ position: 'absolute', right: -60, bottom: 0, zIndex: -1, opacity: 0.5, maxWidth: 300 }}
                    />
                    <div className="container">
                        <div className="row">
                            <div className="col-lg-8 m-auto">
                                <div className="heading4 text-center space-margin60">
                                    <SectionEyebrow label={t('home.testimonials.eyebrow')} icon="fa-solid fa-comment-dots" accent="var(--sca-yellow)" />
                                    <div className="space20" />
                                    <p style={{ color: 'rgba(255,255,255,0.75)' }}>{t('home.testimonials.body')}</p>
                                </div>
                            </div>
                        </div>
                        <div className="row" style={{ rowGap: 24 }}>
                            {testimonials.map((testimonial) => (
                                <div key={testimonial.author} className="col-lg-4 col-md-6">
                                    <div className="sca-card sca-testimonial">
                                        <p style={{ paddingTop: 10 }}>{testimonial.quote}</p>
                                        <div className="space24" />
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                                            <span className="sca-avatar">{initials(testimonial.author)}</span>
                                            <span>
                                                <h4 style={{ marginBottom: 4 }}>{testimonial.author}</h4>
                                                <span className="sca-meta">
                                                    {testimonial.role} — {testimonial.country}
                                                </span>
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Partners & sponsors */}
                <div className="sp6" style={{ position: 'relative', zIndex: 1 }}>
                    <div className="container">
                        <div className="row">
                            <div className="col-lg-8 m-auto">
                                <div className="heading4 text-center space-margin60">
                                    <SectionEyebrow label={t('home.partners.eyebrow')} icon="fa-solid fa-handshake" accent="var(--sca-green)" />
                                    <div className="space20" />
                                    <p style={{ color: 'rgba(255,255,255,0.75)' }}>{t('home.partners.body')}</p>
                                </div>
                            </div>
                        </div>
                        <div className="row" style={{ rowGap: 24 }}>
                            {sponsors.map((sponsor) => (
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
                        <div className="space48" />
                        <div className="text-center">
                            <div className="btn-area1" style={{ display: 'inline-block' }}>
                                <Link href={`/${locale}/sponsors`} className="vl-btn4">
                                    <span className="text">{t('home.partners.become_partner')}</span>
                                    {arrowIcon}
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Closing CTA */}
                <div className="cta4-section-area sp6">
                    <div className="container">
                        <div className="row align-items-center">
                            <div className="col-lg-9">
                                <div className="cta-heading1">
                                    <Reveal direction="left" as="div">
                                        <SectionEyebrow label={t('cta.eyebrow')} icon="fa-solid fa-ticket" accent="var(--sca-red)" />
                                    </Reveal>
                                    <div className="space48" />
                                    <Reveal direction="up" as="h2">
                                        {t('cta.title_1')} <span>{t('cta.title_2')}</span>
                                    </Reveal>
                                    <div className="space18" />
                                    <p style={{ color: 'rgba(255,255,255,0.75)', maxWidth: 640 }}>{t('cta.body')}</p>
                                </div>
                            </div>
                            <div className="col-lg-2">
                                <div className="arrow-cta-btn">
                                    <Link href={`/${locale}/register`} aria-label={t('common.register_now')}>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 80 80" fill="none">
                                            <path d="M40 12.5V67.5" stroke="white" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
                                            <path d="M17.5 45L40 67.5L62.5 45" stroke="white" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </SiteLayout>
    );
}
