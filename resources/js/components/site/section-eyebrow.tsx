import { CSSProperties } from 'react';

interface Props {
    label: string;
    icon?: string;
    /** One of the logo accent colors; defaults to brand pink. */
    accent?: string;
}

/** The capsule-plus-circle brand device (from the CTA buttons) as a section eyebrow. */
export function SectionEyebrow({ label, icon = 'fa-solid fa-bolt', accent }: Props) {
    return (
        <div className="sca-eyebrow" style={accent ? ({ '--sca-accent': accent } as CSSProperties) : undefined}>
            <span className="sca-eyebrow-text">{label}</span>
            <span className="sca-eyebrow-dot">
                <i className={icon} aria-hidden="true" />
            </span>
        </div>
    );
}
