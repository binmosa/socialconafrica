import type { PropsWithChildren } from 'react';
import { BottomNav } from '@/components/voter/bottom-nav';
import { SiteFooter } from '@/components/voter/site-footer';
import { SiteHeader } from '@/components/voter/site-header';
import { useFlashToast } from '@/hooks/use-flash-toast';

export default function VoterLayout({ children }: PropsWithChildren) {
    useFlashToast();

    return (
        <div className="flex min-h-dvh flex-col">
            <SiteHeader />
            <main className="flex-1">{children}</main>
            <SiteFooter />
            <BottomNav />
        </div>
    );
}
