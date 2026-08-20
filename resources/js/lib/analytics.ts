/**
 * Fire-and-forget funnel analytics beacon. Event names are whitelisted
 * server-side; failures are silently ignored — analytics must never
 * affect the voting flow.
 */
export function track(
    event: string,
    payload: {
        nominee_id?: number;
        properties?: Record<string, string | number | boolean>;
    } = {},
): void {
    const body = JSON.stringify({ event, ...payload });

    try {
        if (navigator.sendBeacon) {
            navigator.sendBeacon(
                '/events',
                new Blob([body], { type: 'application/json' }),
            );

            return;
        }

        void fetch('/events', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body,
            keepalive: true,
        });
    } catch {
        // ignore
    }
}
