import { createInertiaApp } from '@inertiajs/react';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { initializeTheme } from '@/hooks/use-appearance';
import VoterLayout from '@/layouts/voter-layout';

const appName = import.meta.env.VITE_APP_NAME || 'SocialCon Africa Awards';

createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),
    layout: () => VoterLayout,
    strictMode: true,
    withApp(app) {
        return (
            <TooltipProvider delayDuration={0}>
                {app}
                <Toaster />
            </TooltipProvider>
        );
    },
    progress: {
        color: '#6c3bf4',
    },
});

// This will set light / dark mode on load...
initializeTheme();
