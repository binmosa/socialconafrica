import type { Auth } from '@/types/auth';

declare module 'react' {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    interface InputHTMLAttributes<T> {
        passwordrules?: string;
    }
}

declare module '@inertiajs/core' {
    export interface InertiaConfig {
        sharedPageProps: {
            name: string;
            auth: Auth;
            sidebarOpen: boolean;
            locale: 'en' | 'am' | 'fr';
            availableLocales: readonly ('en' | 'am' | 'fr')[];
            translations: { site: Record<string, unknown> };
            [key: string]: unknown;
        };
    }
}
