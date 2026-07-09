export interface DiagnosticRecord {
  id: string;
  user_id: string;
  pathogen: string;
  severity: string;
  management: string;
  technical_warning: string;
  confirmed: boolean;
  confirmed_by: string | null;
  confirmed_at: string | null;
  created_at: string;
}

export interface PendingDiagnosticRecord extends DiagnosticRecord {
  user_name: string;
}
