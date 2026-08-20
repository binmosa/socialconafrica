import type { Auth } from '@/types/auth';
import type { ActiveDraw, VotingWindow } from '@/types';

declare module '@inertiajs/core' {
    export interface InertiaConfig {
        sharedPageProps: {
            name: string;
            auth: Auth;
            locale: 'en' | 'am';
            availableLocales: readonly ('en' | 'am')[];
            translations: { site: Record<string, unknown> };
            votingWindow: VotingWindow;
            activeDraw: ActiveDraw;
            flash: { success?: string; error?: string };
            [key: string]: unknown;
        };
    }
}
