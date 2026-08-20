export type VoterSummary = {
    id: number;
    display_name: string;
    has_verified_phone: boolean;
    phone_masked: string | null;
};

export type Auth = {
    voter: VoterSummary | null;
};
