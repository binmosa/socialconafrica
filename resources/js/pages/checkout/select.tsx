import { Head, useForm } from '@inertiajs/react';
import { ArrowRight, ShieldCheck } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { NomineeAvatar } from '@/components/voter/nominee-avatar';
import { PinwheelGlyph } from '@/components/voter/pinwheel-glyph';
import { useT } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { store as ordersStore } from '@/routes/orders';

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
        window.history.replaceState(
            null,
            '',
            `${window.location.pathname}?${params}`,
        );
    }, [qty]);

    const customAmount = customEtb === '' ? null : Number(customEtb);
    const customIsValid =
        customAmount !== null &&
        Number.isInteger(customAmount) &&
        customAmount >= unitEtb &&
        customAmount % unitEtb === 0;

    const effectiveQty =
        customAmount !== null && customIsValid ? customAmount / unitEtb : qty;
    const totalEtb = useMemo(
        () => effectiveQty * unitEtb,
        [effectiveQty, unitEtb],
    );

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

            {/* Compact stage header */}
            <section className="relative overflow-hidden stage">
                <div className="relative mx-auto flex max-w-2xl animate-rise items-center gap-5 px-4 py-10 md:py-12">
                    <NomineeAvatar
                        name={nominee.display_name}
                        imagePath={nominee.image_path}
                        className="size-20 text-2xl"
                    />
                    <div className="min-w-0">
                        <p className="inline-flex items-center gap-2 text-[13px] font-semibold tracking-[0.08em] uppercase">
                            <PinwheelGlyph className="size-[18px] text-gold-fill" />
                            {t('checkout.eyebrow')}
                        </p>
                        <h1 className="mt-1.5 truncate font-display text-2xl font-bold md:text-3xl">
                            {t('checkout.title', {
                                name: nominee.display_name,
                            })}
                        </h1>
                        <p className="text-white/70">@{nominee.handle}</p>
                    </div>
                </div>
            </section>

            <section className="mx-auto max-w-2xl px-4 py-10 md:py-14">
                <p className="text-[13px] font-semibold tracking-[0.08em] text-violet uppercase">
                    {t('checkout.packages_label')}
                </p>
                <div
                    className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4"
                    role="group"
                    aria-label={t('checkout.packages_label')}
                >
                    {presets.map((preset) => {
                        const active =
                            customEtb === '' && qty === preset.vote_qty;

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
                                    'cursor-pointer rounded-2xl px-3 py-4 text-center transition-all',
                                    active
                                        ? 'bg-brand text-white shadow-glow'
                                        : 'bg-white text-ink hover:-translate-y-0.5 hover:shadow-lift',
                                )}
                            >
                                <span className="block text-sm font-semibold">
                                    {preset.vote_qty}{' '}
                                    {preset.vote_qty === 1
                                        ? t('checkout.vote_unit')
                                        : t('checkout.votes_unit')}
                                </span>
                                <span className="mt-1.5 block font-display text-3xl font-bold tracking-tight tabular-nums">
                                    {(
                                        preset.amount_minor / 100
                                    ).toLocaleString()}
                                </span>
                                <span
                                    className={cn(
                                        'block text-[11px] font-semibold uppercase',
                                        active
                                            ? 'text-white/80'
                                            : 'text-ink/60',
                                    )}
                                >
                                    {t('common.etb')}
                                </span>
                            </button>
                        );
                    })}
                </div>

                <div className="mt-8 rounded-2xl bg-white p-5 md:p-6">
                    <div className="space-y-1.5">
                        <Label
                            htmlFor="custom"
                            className="text-sm font-semibold"
                        >
                            {t('checkout.custom_label')}
                        </Label>
                        <Input
                            id="custom"
                            inputMode="numeric"
                            placeholder={t('checkout.custom_placeholder')}
                            value={customEtb}
                            onChange={(e) =>
                                setCustomEtb(e.target.value.replace(/\D/g, ''))
                            }
                            className="h-12 bg-paper text-base"
                        />
                        <p
                            className={cn(
                                'text-xs',
                                customEtb !== '' && !customIsValid
                                    ? 'text-ember'
                                    : 'text-ink/60',
                            )}
                        >
                            {t('checkout.custom_hint', {
                                min: unitEtb,
                                unit: unitEtb,
                            })}
                        </p>
                        {form.errors && 'amount_etb' in form.errors && (
                            <p className="text-sm text-ember">
                                {String(form.errors.amount_etb)}
                            </p>
                        )}
                    </div>

                    <div className="mt-6 flex items-center justify-between rounded-xl bg-night px-5 py-4 text-white">
                        <span className="text-sm font-semibold text-white/70">
                            {t('checkout.total')} · {effectiveQty}{' '}
                            {effectiveQty === 1
                                ? t('checkout.vote_unit')
                                : t('checkout.votes_unit')}
                        </span>
                        <span className="font-display text-3xl font-bold text-gold-fill tabular-nums">
                            {totalEtb.toLocaleString()} {t('common.etb')}
                        </span>
                    </div>

                    {paymentsPaused ? (
                        <p className="mt-4 rounded-xl border border-ember/40 bg-ember/10 px-4 py-3 text-sm text-ember">
                            {t('checkout.paused_notice')}
                        </p>
                    ) : (
                        <Button
                            size="xl"
                            className="mt-4 w-full"
                            disabled={
                                form.processing ||
                                (customEtb !== '' && !customIsValid)
                            }
                            onClick={submit}
                        >
                            {t('checkout.pay_cta')}
                            <ArrowRight className="cta-arrow" aria-hidden />
                        </Button>
                    )}

                    <p className="mt-4 flex items-center justify-center gap-2 text-center text-xs text-ink/60">
                        <ShieldCheck
                            className="size-4 text-violet"
                            aria-hidden
                        />
                        {t('checkout.one_nominee_note')}
                    </p>
                </div>
            </section>
        </>
    );
}
