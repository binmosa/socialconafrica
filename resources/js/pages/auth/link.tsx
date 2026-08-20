import { Head, useForm } from '@inertiajs/react';
import { ShieldCheck } from 'lucide-react';
import { send as linkSend, store as linkStore } from '@/routes/auth/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useT } from '@/lib/i18n';

type LinkProps = {
    provider: string;
    phoneMasked: string;
    otpSent: boolean;
};

export default function AccountLink({ provider, phoneMasked, otpSent }: LinkProps) {
    const { t, locale } = useT();

    const send = useForm({});
    const verify = useForm({ code: '' });

    return (
        <>
            <Head title={t('auth.link_title')} />

            <section className="mx-auto max-w-md px-4 py-14">
                <div className="rounded-2xl border border-gold-fill/40 bg-card p-7">
                    <ShieldCheck className="mb-4 size-9 text-gold" aria-hidden />
                    <h1 className="font-display text-2xl font-extrabold tracking-tight">
                        {t('auth.link_title')}
                    </h1>
                    <p className="mt-2 text-sm text-mist">
                        {t('auth.link_body', { provider, phone: phoneMasked })}
                    </p>

                    {!otpSent ? (
                        <Button
                            size="lg"
                            className="mt-6 w-full font-semibold"
                            disabled={send.processing}
                            onClick={() => send.post(linkSend(locale).url, { preserveScroll: true })}
                        >
                            {t('auth.link_send_code', { phone: phoneMasked })}
                        </Button>
                    ) : (
                        <form
                            className="mt-6 space-y-4"
                            onSubmit={(event) => {
                                event.preventDefault();
                                verify.post(linkStore(locale).url, { preserveScroll: true });
                            }}
                        >
                            <div className="space-y-1.5">
                                <Label htmlFor="code">{t('auth.code_label')}</Label>
                                <Input
                                    id="code"
                                    inputMode="numeric"
                                    autoComplete="one-time-code"
                                    maxLength={6}
                                    value={verify.data.code}
                                    onChange={(e) =>
                                        verify.setData('code', e.target.value.replace(/\D/g, ''))
                                    }
                                    className="h-12 bg-paper text-center font-display text-xl tracking-[0.4em]"
                                />
                                {verify.errors.code && (
                                    <p className="text-sm text-ember">{verify.errors.code}</p>
                                )}
                            </div>
                            <Button
                                type="submit"
                                size="lg"
                                className="w-full font-semibold"
                                disabled={verify.processing}
                            >
                                {t('auth.link_verify')}
                            </Button>
                        </form>
                    )}
                </div>
            </section>
        </>
    );
}
