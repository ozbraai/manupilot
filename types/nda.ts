export interface NdaAcceptance {
    id: string;
    user_id: string;
    nda_version: string;
    typed_name?: string | null;
    accepted_at: string;
    ip_address?: string | null;
    user_agent?: string | null;
    created_at: string;
    updated_at: string;
}
