interface Chip {
    value: string;
    label: string;
}

interface Props {
    chips: Chip[];
    active: string;
    onChange: (value: string) => void;
}

export function FilterChips({ chips, active, onChange }: Props) {
    return (
        <ul className="nav nav-pills justify-content-center" role="tablist" style={{ gap: 10 }}>
            {chips.map((chip) => (
                <li key={chip.value} className="nav-item" role="presentation">
                    <button
                        type="button"
                        role="tab"
                        aria-selected={active === chip.value}
                        onClick={() => onChange(chip.value)}
                        className={`sca-badge ${active === chip.value ? '' : 'inactive'}`}
                        style={{
                            border: 'none',
                            cursor: 'pointer',
                            background: active === chip.value ? '#FF0A9D' : 'rgba(255,255,255,0.12)',
                            color: '#fff',
                            padding: '10px 20px',
                        }}
                    >
                        {chip.label}
                    </button>
                </li>
            ))}
        </ul>
    );
}
