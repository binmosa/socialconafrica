import { useEffect, useRef } from 'react';

/**
 * Renders the official Telegram Login Widget, which posts the signed
 * payload to our verification callback.
 */
export function TelegramLoginButton({ bot, authUrl }: { bot: string; authUrl: string }) {
    const container = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const node = container.current;
        if (!node) {
            return;
        }

        const script = document.createElement('script');
        script.src = 'https://telegram.org/js/telegram-widget.js?22';
        script.async = true;
        script.setAttribute('data-telegram-login', bot);
        script.setAttribute('data-size', 'large');
        script.setAttribute('data-radius', '10');
        script.setAttribute('data-auth-url', authUrl);
        script.setAttribute('data-request-access', 'write');
        node.appendChild(script);

        return () => {
            node.replaceChildren();
        };
    }, [bot, authUrl]);

    return <div ref={container} className="flex justify-center" />;
}
