import { FormEvent, useState } from 'react';

import { useT } from '@/lib/i18n';

interface Props {
    open: boolean;
    onClose: () => void;
}

export function NewsletterPopup({ open, onClose }: Props) {
    const { t } = useT();
    const [email, setEmail] = useState('');

    if (!open) {
        return null;
    }

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        // Wire up to backend later.
        onClose();
    };

    return (
        <div id="popup" className="popup-overlay" role="dialog" aria-modal="true" aria-label={t('popup.title')}>
            <div className="popup-content">
                <button type="button" className="close-btn" onClick={onClose} aria-label="Close">
                    &times;
                </button>
                <div className="popup-section-area">
                    <div className="container">
                        <div className="row">
                            <div className="col-lg-6">
                                <div className="img1">
                                    <img
                                        src="/template/img/all-images/others/others-img12.png"
                                        alt=""
                                        loading="lazy"
                                    />
                                </div>
                            </div>
                            <div className="col-lg-6">
                                <div
                                    className="cta1-main-boxarea heading1"
                                    style={{
                                        backgroundImage: 'url(/template/img/all-images/bg/cta-bg1.png)',
                                        backgroundPosition: 'center',
                                        backgroundRepeat: 'no-repeat',
                                        backgroundSize: 'cover',
                                    }}
                                >
                                    <h5>
                                        <img src="/template/img/icons/sub-logo1.svg" alt="" /> {t('popup.brand')}
                                    </h5>
                                    <div className="space28" />
                                    <h2>{t('popup.title')}</h2>
                                    <div className="space40" />
                                    <form onSubmit={handleSubmit}>
                                        <input
                                            type="email"
                                            required
                                            placeholder={t('popup.placeholder')}
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                        />
                                        <button type="submit" className="vl-btn1">
                                            <span className="nisoz-btn__shape" />
                                            <span className="nisoz-btn__shape" />
                                            <span className="nisoz-btn__shape" />
                                            <span className="nisoz-btn__shape" />
                                            <span className="vl-btn1__text">{t('popup.submit')}</span>
                                        </button>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
