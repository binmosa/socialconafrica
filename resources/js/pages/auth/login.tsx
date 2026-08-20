import { Head, useForm } from '@inertiajs/react';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { PinwheelGlyph } from '@/components/voter/pinwheel-glyph';
import { TelegramLoginButton } from '@/components/voter/telegram-login-button';
import { useT } from '@/lib/i18n';
import { google } from '@/routes/auth';
import { send as otpSend, verify as otpVerify } from '@/routes/otp';

type LoginProps = {
    telegramBot: string | null;
    otpPhone: string | null;
};

function GoogleMark() {
    return (
        <svg viewBox="0 0 24 24" className="size-4" aria-hidden>
            <path
                fill="currentColor"
                d="M21.35 11.1H12v2.9h5.35c-.5 2.4-2.55 3.9-5.35 3.9a5.9 5.9 0 1 1 0-11.8c1.5 0 2.85.55 3.9 1.45l2.15-2.15A8.9 8.9 0 1 0 12 20.9c5.15 0 8.8-3.6 8.8-8.7 0-.4-.05-.75-.1-1.1Z"
            />
        </svg>
    );
}

export default function Login({ telegramBot, otpPhone }: LoginProps) {
    const { t, locale } = useT();

    const request = useForm({ phone: '' });
    const verify = useForm({
        phone: otpPhone ?? '',
        code: '',
        display_name: '',
    });

    const sendCode = () => {
        request.post(otpSend(locale).url, { preserveScroll: true });
    };

    const verifyCode = () => {
        verify.transform((data) => ({
            ...data,
            phone: otpPhone ?? data.phone,
        }));
        verify.post(otpVerify(locale).url, { preserveScroll: true });
    };

    return (
        <>
            <Head title={t('auth.sign_in_title')} />

            <section className="relative min-h-[80vh] overflow-hidden stage py-12 md:py-20">
                <div className="relative mx-auto max-w-md animate-rise px-4">
                    <div className="text-center">
                        <p className="inline-flex items-center gap-2 text-[13px] font-semibold tracking-[0.08em] uppercase">
                            <PinwheelGlyph className="size-[18px] text-gold-fill" />
                            {t('auth.eyebrow')}
                        </p>
                        <h1 className="mt-4 font-display text-display-md font-bold">
                            {t('auth.sign_in_title')}
                        </h1>
                        <p className="mt-3 text-white/70">
                            {t('auth.sign_in_subtitle')}
                        </p>
                    </div>

                    <div className="mt-8 rounded-2xl bg-white p-6 text-ink shadow-[0_30px_60px_-30px_rgb(0_0_0/0.6)] md:p-8">
                        <div className="space-y-3">
                            <Button
                                asChild
                                size="lg"
                                variant="outline"
                                className="w-full"
                            >
                                <a href={google().url}>
                                    <GoogleMark />
                                    {t('auth.continue_google')}
                                </a>
                            </Button>

                            {telegramBot && (
                                <TelegramLoginButton
                                    bot={telegramBot}
                                    authUrl={new URL(
                                        '/auth/telegram/callback',
                                        window.location.origin,
                                    ).toString()}
                                />
                            )}
                        </div>

                        <div className="my-7 flex items-center gap-3">
                            <Separator className="flex-1" />
                            <span className="text-xs font-semibold tracking-widest text-ink/50 uppercase">
                                {t('auth.or_phone')}
                            </span>
                            <Separator className="flex-1" />
                        </div>

                        {otpPhone === null ? (
                            <form
                                className="space-y-4"
                                onSubmit={(event) => {
                                    event.preventDefault();
                                    sendCode();
                                }}
                            >
                                <div className="space-y-1.5">
                                    <Label
                                        htmlFor="phone"
                                        className="font-semibold"
                                    >
                                        {t('auth.phone_label')}
                                    </Label>
                                    <Input
                                        id="phone"
                                        type="tel"
                                        inputMode="tel"
                                        autoComplete="tel"
                                        placeholder={t(
                                            'auth.phone_placeholder',
                                        )}
                                        value={request.data.phone}
                                        onChange={(e) =>
                                            request.setData(
                                                'phone',
                                                e.target.value,
                                            )
                                        }
                                        className="h-12 bg-paper text-base"
                                    />
                                    {request.errors.phone && (
                                        <p className="text-sm text-ember">
                                            {request.errors.phone}
                                        </p>
                                    )}
                                </div>
                                <Button
                                    type="submit"
                                    size="lg"
                                    className="w-full"
                                    disabled={request.processing}
                                >
                                    {t('auth.send_code')}
                                    <ArrowRight
                                        className="cta-arrow"
                                        aria-hidden
                                    />
                                </Button>
                            </form>
                        ) : (
                            <form
                                className="space-y-4"
                                onSubmit={(event) => {
                                    event.preventDefault();
                                    verifyCode();
                                }}
                            >
                                <p className="text-sm text-ink/70">
                                    {t('auth.code_sent_to', {
                                        phone: otpPhone,
                                    })}
                                </p>
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
                                <div className="space-y-1.5">
                                    <Label
                                        htmlFor="display_name"
                                        className="font-semibold"
                                    >
                                        {t('auth.name_label')}
                                    </Label>
                                    <Input
                                        id="display_name"
                                        autoComplete="name"
                                        placeholder={t('auth.name_placeholder')}
                                        value={verify.data.display_name}
                                        onChange={(e) =>
                                            verify.setData(
                                                'display_name',
                                                e.target.value,
                                            )
                                        }
                                        className="h-12 bg-paper text-base"
                                    />
                                </div>
                                <Button
                                    type="submit"
                                    size="lg"
                                    className="w-full"
                                    disabled={verify.processing}
                                >
                                    {t('auth.verify_code')}
                                    <ArrowRight
                                        className="cta-arrow"
                                        aria-hidden
                                    />
                                </Button>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    className="w-full text-ink/60"
                                    onClick={() =>
                                        window.location.assign(
                                            window.location.pathname,
                                        )
                                    }
                                >
                                    {t('auth.change_phone')}
                                </Button>
                            </form>
                        )}
                    </div>
                </div>
            </section>
        </>
    );
}
