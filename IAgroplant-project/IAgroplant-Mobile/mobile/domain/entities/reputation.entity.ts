export interface ReputationEntry {
  id: string;
  action_type: string;
  points: number;
  reason: string | null;
  reference_id: string | null;
  created_at: string;
}

export interface ReputationSummary {
  total: number;
  entries: ReputationEntry[];
}
