import { Head, useForm } from '@inertiajs/react';
import { send as otpSend, verify as otpVerify } from '@/routes/otp';
import { google } from '@/routes/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { TelegramLoginButton } from '@/components/voter/telegram-login-button';
import { useT } from '@/lib/i18n';

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
    const verify = useForm({ phone: otpPhone ?? '', code: '', display_name: '' });

    const sendCode = () => {
        request.post(otpSend(locale).url, { preserveScroll: true });
    };

    const verifyCode = () => {
        verify.transform((data) => ({ ...data, phone: otpPhone ?? data.phone }));
        verify.post(otpVerify(locale).url, { preserveScroll: true });
    };

    return (
        <>
            <Head title={t('auth.sign_in_title')} />

            <section className="mx-auto max-w-md px-4 py-14">
                <header className="mb-8 text-center">
                    <h1 className="font-display text-3xl font-extrabold tracking-tight">
                        {t('auth.sign_in_title')}
                    </h1>
                    <p className="mt-2 text-sm text-mist">{t('auth.sign_in_subtitle')}</p>
                </header>

                <div className="space-y-3">
                    <Button asChild size="lg" variant="outline" className="w-full font-medium">
                        <a href={google().url}>
                            <GoogleMark />
                            {t('auth.continue_google')}
                        </a>
                    </Button>

                    {telegramBot && (
                        <TelegramLoginButton
                            bot={telegramBot}
                            authUrl={new URL('/auth/telegram/callback', window.location.origin).toString()}
                        />
                    )}
                </div>

                <div className="my-7 flex items-center gap-3">
                    <Separator className="flex-1" />
                    <span className="text-xs font-medium tracking-widest text-mist uppercase">
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
                            <Label htmlFor="phone">{t('auth.phone_label')}</Label>
                            <Input
                                id="phone"
                                type="tel"
                                inputMode="tel"
                                autoComplete="tel"
                                placeholder={t('auth.phone_placeholder')}
                                value={request.data.phone}
                                onChange={(e) => request.setData('phone', e.target.value)}
                                className="h-11 bg-card"
                            />
                            {request.errors.phone && (
                                <p className="text-sm text-ember">{request.errors.phone}</p>
                            )}
                        </div>
                        <Button
                            type="submit"
                            size="lg"
                            className="w-full font-semibold"
                            disabled={request.processing}
                        >
                            {t('auth.send_code')}
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
                        <p className="text-sm text-mist">
                            {t('auth.code_sent_to', { phone: otpPhone })}
                        </p>
                        <div className="space-y-1.5">
                            <Label htmlFor="code">{t('auth.code_label')}</Label>
                            <Input
                                id="code"
                                inputMode="numeric"
                                autoComplete="one-time-code"
                                maxLength={6}
                                value={verify.data.code}
                                onChange={(e) => verify.setData('code', e.target.value.replace(/\D/g, ''))}
                                className="h-12 bg-card text-center font-display text-xl tracking-[0.4em]"
                            />
                            {verify.errors.code && (
                                <p className="text-sm text-ember">{verify.errors.code}</p>
                            )}
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="display_name">{t('auth.name_label')}</Label>
                            <Input
                                id="display_name"
                                autoComplete="name"
                                placeholder={t('auth.name_placeholder')}
                                value={verify.data.display_name}
                                onChange={(e) => verify.setData('display_name', e.target.value)}
                                className="h-11 bg-card"
                            />
                        </div>
                        <Button
                            type="submit"
                            size="lg"
                            className="w-full font-semibold"
                            disabled={verify.processing}
                        >
                            {t('auth.verify_code')}
                        </Button>
                        <Button
                            type="button"
                            variant="ghost"
                            className="w-full text-mist"
                            onClick={() => window.location.assign(window.location.pathname)}
                        >
                            {t('auth.change_phone')}
                        </Button>
                    </form>
                )}
            </section>
        </>
    );
}
