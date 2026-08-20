import { Check, Copy, Share2 } from 'lucide-react';
import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useClipboard } from '@/hooks/use-clipboard';
import { track } from '@/lib/analytics';
import { useT } from '@/lib/i18n';

type ShareSheetProps = {
    shareUrl: string;
    text: string;
    nomineeId: number;
};

export function ShareSheet({ shareUrl, text, nomineeId }: ShareSheetProps) {
    const { t } = useT();
    const [copied, copy] = useClipboard();
    const [open, setOpen] = useState(false);

    const url = new URL(shareUrl);
    url.searchParams.set('utm_source', 'share');

    const encodedUrl = encodeURIComponent(url.toString());
    const encodedText = encodeURIComponent(text);

    const targets = [
        { name: 'Telegram', href: `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}` },
        { name: 'WhatsApp', href: `https://wa.me/?text=${encodedText}%20${encodedUrl}` },
        { name: 'Facebook', href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}` },
        { name: 'TikTok', href: `https://www.tiktok.com/` },
    ];

    const onShare = (target: string) => {
        track('share_clicked', { nominee_id: nomineeId, properties: { target } });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="lg" variant="outline" className="w-full">
                    <Share2 aria-hidden />
                    {t('nominees.share')}
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-sm border-border bg-card">
                <DialogHeader>
                    <DialogTitle className="font-display">{t('nominees.share')}</DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-2 gap-2">
                    {targets.map((target) => (
                        <Button key={target.name} asChild variant="secondary">
                            <a
                                href={target.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={() => onShare(target.name.toLowerCase())}
                            >
                                {target.name}
                            </a>
                        </Button>
                    ))}
                    <Button
                        variant="secondary"
                        className="col-span-2"
                        onClick={() => {
                            void copy(url.toString());
                            onShare('copy');
                        }}
                    >
                        {copied ? <Check aria-hidden /> : <Copy aria-hidden />}
                        {copied ? t('nominees.link_copied') : t('nominees.copy_link')}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
