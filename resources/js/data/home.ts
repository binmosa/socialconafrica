export interface Speaker {
    name: string;
    role: string;
    image: string;
    socials: { facebook?: string; linkedin?: string; instagram?: string };
}

export const speakers: Speaker[] = [
    { name: 'Rovman Powell', role: 'Speaker- UI/UX Designer', image: '/template/img/all-images/team/team-img6.png', socials: {} },
    { name: 'Reace Topely JR', role: 'Senior UI/UX Designer', image: '/template/img/all-images/team/team-img7.png', socials: {} },
    { name: 'Jofran Archer', role: 'Founder- FleexStudio', image: '/template/img/all-images/team/team-img8.png', socials: {} },
    { name: 'Darwish Rasooli', role: 'Senior UI/UX Designer', image: '/template/img/all-images/team/team-img9.png', socials: {} },
    { name: 'Rovman Powell', role: 'Speaker- UI/UX Designer', image: '/template/img/all-images/team/team-img6.png', socials: {} },
    { name: 'Reace Topely JR', role: 'Senior UI/UX Designer', image: '/template/img/all-images/team/team-img7.png', socials: {} },
];

export const sponsors: string[] = [
    '/template/img/elements/elements9.png',
    '/template/img/elements/elements10.png',
    '/template/img/elements/elements11.png',
    '/template/img/elements/elements12.png',
    '/template/img/elements/elements13.png',
    '/template/img/elements/elements14.png',
    '/template/img/elements/elements15.png',
    '/template/img/elements/elements16.png',
];

export const works: Array<{ image: string; year: string; name: string }> = [
    { image: '/template/img/all-images/work/work-img1.png', year: 'Event 2024', name: 'Freelancer Meetup' },
    { image: '/template/img/all-images/work/work-img2.png', year: 'Event 2024', name: 'Freelancer Meetup' },
    { image: '/template/img/all-images/work/work-img3.png', year: 'Event 2024', name: 'Freelancer Meetup' },
    { image: '/template/img/all-images/work/work-img1.png', year: 'Event 2024', name: 'Freelancer Meetup' },
    { image: '/template/img/all-images/work/work-img2.png', year: 'Event 2024', name: 'Freelancer Meetup' },
    { image: '/template/img/all-images/work/work-img3.png', year: 'Event 2024', name: 'Freelancer Meetup' },
];

export interface Ticket {
    tierKey: 'regular' | 'premium' | 'platinum';
    price: string;
    sold: number;
    total: number;
}

export const tickets: Ticket[] = [
    { tierKey: 'regular', price: '$49', sold: 470, total: 500 },
    { tierKey: 'premium', price: '$80', sold: 150, total: 200 },
    { tierKey: 'platinum', price: '$150', sold: 80, total: 100 },
];

// Event date used by the countdown timer.
export const EVENT_DATE = new Date('2026-02-25T09:00:00Z');
