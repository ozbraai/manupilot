export type SampleStatus = 'requested' | 'in_production' | 'shipped' | 'received' | 'approved' | 'revision_required';

export type Sample = {
    id: string;
    project_id: string;
    supplier_id?: string;
    sample_number: string; // "T1", "T2"
    status: SampleStatus;
    requested_at: string;
    received_at?: string;
    evaluated_at?: string;
    notes?: string;
    created_at: string;
};

export type SampleQCItem = {
    id: string;
    sample_id: string;
    criteria: string;
    result: 'pass' | 'fail' | 'not_checked';
    comment?: string;
    created_at: string;
};

export type SamplePhoto = {
    id: string;
    sample_id: string;
    file_url: string;
    caption?: string;
    created_at: string;
};
