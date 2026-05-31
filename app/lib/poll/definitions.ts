export type PollStatus = "draft" | "open" | "closed";
export type RoleName = "admin" | "usuario" | "lector";

export type PollOptionInput = {
  id?: string;
  label: string;
  position: number;
};

export type PollInput = {
  id?: string;
  title: string;
  description: string;
  question: string;
  status: PollStatus;
  starts_at: string | null;
  ends_at: string | null;
  options: PollOptionInput[];
};

export type PollTableRow = {
  id: string;
  title: string;
  description: string | null;
  question: string;
  status: PollStatus;
  starts_at: string | null;
  ends_at: string | null;
  created_at: string;
  created_by: string;
  creator_name: string;
  votes_count: number;
};

export type PollOption = {
  id: string;
  poll_id: string;
  label: string;
  position: number;
  votes_count: number;
};

export type PollDetails = PollTableRow & {
  options: PollOption[];
  user_vote_option_id?: string | null;
};

export type DashboardMetrics = {
  activePolls: number;
  closedPolls: number;
  totalVotes: number;
  participationRate: number;
};
