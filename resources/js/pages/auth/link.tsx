import { Head, useForm } from '@inertiajs/react';
import { ArrowRight, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useT } from '@/lib/i18n';
import { send as linkSend, store as linkStore } from '@/routes/auth/link';

type LinkProps = {
    provider: string;
    phoneMasked: string;
    otpSent: boolean;
};

export default function AccountLink({
    provider,
    phoneMasked,
    otpSent,
}: LinkProps) {
    const { t, locale } = useT();

    const send = useForm({});
    const verify = useForm({ code: '' });

    return (
        <>
            <Head title={t('auth.link_title')} />

            <section className="relative min-h-[80vh] overflow-hidden stage py-12 md:py-20">
                <div className="relative mx-auto max-w-md animate-rise px-4">
                    <div className="rounded-2xl bg-brand p-[2px]">
                        <div className="rounded-[calc(1rem-2px)] bg-white p-7 text-ink md:p-8">
                            <span className="flex size-12 items-center justify-center rounded-full bg-brand text-white">
                                <ShieldCheck className="size-6" aria-hidden />
                            </span>
                            <h1 className="mt-5 font-display text-2xl font-bold tracking-tight md:text-3xl">
                                {t('auth.link_title')}
                            </h1>
                            <p className="mt-2 text-ink/70">
                                {t('auth.link_body', {
                                    provider,
                                    phone: phoneMasked,
                                })}
                            </p>

                            {!otpSent ? (
                                <Button
                                    size="lg"
                                    className="mt-6 w-full"
                                    disabled={send.processing}
                                    onClick={() =>
                                        send.post(linkSend(locale).url, {
                                            preserveScroll: true,
                                        })
                                    }
                                >
                                    {t('auth.link_send_code', {
                                        phone: phoneMasked,
                                    })}
                                    <ArrowRight
                                        className="cta-arrow"
                                        aria-hidden
                                    />
                                </Button>
                            ) : (
                                <form
                                    className="mt-6 space-y-4"
                                    onSubmit={(event) => {
                                        event.preventDefault();
                                        verify.post(linkStore(locale).url, {
                                            preserveScroll: true,
                                        });
                                    }}
                                >
                                    <div className="space-y-1.5">
                                        <Label
                                            htmlFor="code"
                                            className="font-semibold"
                                        >
                                            {t('auth.code_label')}
                                        </Label>
                                        <Input
                                            id="code"
                                            inputMode="numeric"
                                            autoComplete="one-time-code"
                                            maxLength={6}
                                            value={verify.data.code}
                                            onChange={(e) =>
                                                verify.setData(
                                                    'code',
                                                    e.target.value.replace(
                                                        /\D/g,
                                                        '',
                                                    ),
                                                )
                                            }
                                            className="h-14 bg-paper text-center font-display text-2xl tracking-[0.4em]"
                                        />
                                        {verify.errors.code && (
                                            <p className="text-sm text-ember">
                                                {verify.errors.code}
                                            </p>
                                        )}
                                    </div>
                                    <Button
                                        type="submit"
                                        size="lg"
                                        className="w-full"
                                        disabled={verify.processing}
                                    >
                                        {t('auth.link_verify')}
                                        <ArrowRight
                                            className="cta-arrow"
                                            aria-hidden
                                        />
                                    </Button>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}
