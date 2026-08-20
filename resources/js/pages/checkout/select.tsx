import { Head, useForm } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';
import { store as ordersStore } from '@/routes/orders';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { NomineeAvatar } from '@/components/voter/nominee-avatar';
import { useT } from '@/lib/i18n';
import { cn } from '@/lib/utils';

type Preset = {
    vote_qty: number;
    amount_minor: number;
};

type CheckoutProps = {
    nominee: {
        display_name: string;
        handle: string;
        share_slug: string;
        image_path: string | null;
    };
    presets: Preset[];
    unitPriceMinor: number;
    initialQty: number;
    paymentsPaused: boolean;
};

export default function CheckoutSelect({
    nominee,
    presets,
    unitPriceMinor,
    initialQty,
    paymentsPaused,
}: CheckoutProps) {
    const { t, locale } = useT();
    const unitEtb = unitPriceMinor / 100;

    const [qty, setQty] = useState<number>(initialQty);
    const [customEtb, setCustomEtb] = useState<string>('');

    const form = useForm({});

    // The URL carries the vote selection so login redirects, refreshes and
    // locale switches never lose it.
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        params.set('qty', String(qty));
        window.history.replaceState(null, '', `${window.location.pathname}?${params}`);
    }, [qty]);

    const customAmount = customEtb === '' ? null : Number(customEtb);
    const customIsValid =
        customAmount !== null &&
        Number.isInteger(customAmount) &&
        customAmount >= unitEtb &&
        customAmount % unitEtb === 0;

    const effectiveQty = customAmount !== null && customIsValid ? customAmount / unitEtb : qty;
    const totalEtb = useMemo(() => effectiveQty * unitEtb, [effectiveQty, unitEtb]);

    const submit = () => {
        const params = new URLSearchParams(window.location.search);
        const campaign: Record<string, string> = {};
        for (const key of ['utm_source', 'utm_medium', 'utm_campaign', 'ref']) {
            const value = params.get(key);
            if (value) {
                campaign[key] = value;
            }
        }

        form.transform(() =>
            customAmount !== null && customIsValid
                ? { amount_etb: customAmount, ...campaign }
                : { qty, ...campaign },
        );
        form.post(ordersStore({ locale, nominee: nominee.share_slug }).url);
    };

    return (
        <>
            <Head title={t('checkout.title', { name: nominee.display_name })} />

            <section className="mx-auto max-w-md px-4 py-10">
                <header className="mb-7 flex items-center gap-4">
                    <NomineeAvatar
                        name={nominee.display_name}
                        imagePath={nominee.image_path}
                        className="size-14 text-lg"
                    />
                    <div>
                        <h1 className="font-display text-xl font-extrabold tracking-tight">
                            {t('checkout.title', { name: nominee.display_name })}
                        </h1>
                        <p className="text-sm text-mist">@{nominee.handle}</p>
                    </div>
                </header>

                <p className="mb-2 text-sm font-semibold">{t('checkout.packages_label')}</p>
                <div
                    className="grid grid-cols-4 gap-2"
                    role="group"
                    aria-label={t('checkout.packages_label')}
                >
                    {presets.map((preset) => {
                        const active = customEtb === '' && qty === preset.vote_qty;
                        return (
                            <button
                                key={preset.vote_qty}
                                type="button"
                                aria-pressed={active}
                                onClick={() => {
                                    setCustomEtb('');
                                    setQty(preset.vote_qty);
                                }}
                                className={cn(
                                    'rounded-xl border px-2 py-3 text-center transition-colors',
                                    active
                                        ? 'border-gold-fill bg-gold-fill/15 text-gold-soft'
                                        : 'border-border bg-card text-foreground hover:border-gold-fill/40',
                                )}
                            >
                                <span className="block font-display text-lg font-bold tabular-nums">
                                    {preset.vote_qty}
                                </span>
                                <span className="block text-[11px] text-mist">
                                    {(preset.amount_minor / 100).toLocaleString()} {t('common.etb')}
                                </span>
                            </button>
                        );
                    })}
                </div>

                <div className="mt-5 space-y-1.5">
                    <Label htmlFor="custom">{t('checkout.custom_label')}</Label>
                    <Input
                        id="custom"
                        inputMode="numeric"
                        placeholder={t('checkout.custom_placeholder')}
                        value={customEtb}
                        onChange={(e) => setCustomEtb(e.target.value.replace(/\D/g, ''))}
                        className="h-11 bg-card"
                    />
                    <p
                        className={cn(
                            'text-xs',
                            customEtb !== '' && !customIsValid ? 'text-ember' : 'text-mist',
                        )}
                    >
                        {t('checkout.custom_hint', { min: unitEtb, unit: unitEtb })}
                    </p>
                    {form.errors && 'amount_etb' in form.errors && (
                        <p className="text-sm text-ember">{String(form.errors.amount_etb)}</p>
                    )}
                </div>

                <div className="shadow-lift mt-6 flex items-center justify-between rounded-xl border border-border/60 bg-card px-5 py-4">
                    <span className="text-sm text-mist">{t('checkout.total')}</span>
                    <span className="font-display text-2xl font-extrabold text-gold-soft tabular-nums">
                        {totalEtb.toLocaleString()} {t('common.etb')}
                    </span>
                </div>

                {paymentsPaused ? (
                    <p className="mt-4 rounded-xl border border-ember/40 bg-ember/10 px-4 py-3 text-sm text-ember">
                        {t('checkout.paused_notice')}
                    </p>
                ) : (
                    <Button
                        size="lg"
                        className="mt-4 w-full font-semibold"
                        disabled={form.processing || (customEtb !== '' && !customIsValid)}
                        onClick={submit}
                    >
                        {t('checkout.pay_cta')}
                    </Button>
                )}

                <p className="mt-3 text-center text-xs text-mist">{t('checkout.one_nominee_note')}</p>
            </section>
        </>
    );
}
