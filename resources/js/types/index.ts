export type * from './auth';
export type * from './navigation';
export type * from './ui';

import type { Auth } from './auth';

export type Locale = 'en' | 'am';

export type VotingWindow = {
    opens_at: string | null;
    closes_at: string | null;
    is_open: boolean;
};

export type ActiveDraw = {
    week_key: string;
    closes_at: string;
    prizes: { tier: string; label: string; count: number }[];
} | null;

export type CategoryRef = {
    name: string;
    slug: string;
};

export type NomineeCardData = {
    id: number;
    display_name: string;
    handle: string;
    share_slug: string;
    image_path: string | null;
    city: string | null;
    categories: CategoryRef[];
    rank?: number | null;
    approx_votes?: string | null;
};

export type SharedData = {
    name: string;
    auth: Auth;
    locale: Locale;
    availableLocales: string[];
    votingWindow: VotingWindow;
    activeDraw: ActiveDraw;
    flash: { success?: string; error?: string };
    [key: string]: unknown;
};
