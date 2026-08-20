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

export type PublicStanding = {
    rank: number;
    display_name: string;
    handle: string;
    share_slug: string;
    image_path: string | null;
    approx_votes: string;
    /** Relative to the leader (0-100) — drives progress bars. */
    share: number;
    /** Share of all votes cast (percent, one decimal). */
    share_pct: number;
    category?: string | null;
    city?: string | null;
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
    share_pct?: number | null;
};

export type SharedData = {
    name: string;
    auth: Auth;
    locale: Locale;
    availableLocales: string[];
    votingWindow: VotingWindow;
    activeDraw: ActiveDraw;
    pricing: { unit_etb: number };
    flash: { success?: string; error?: string };
    [key: string]: unknown;
};
