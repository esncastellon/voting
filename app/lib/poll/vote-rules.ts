import type { PollStatus, RoleName } from "./definitions";

type PollVoteState = {
  status: PollStatus;
  starts_at: string | null;
  ends_at: string | null;
};

type VoteEligibilityInput = {
  poll: PollVoteState;
  roleName: RoleName | null | undefined;
  alreadyVoted: boolean;
  optionBelongsToPoll: boolean;
  now?: Date;
};

export function getVoteEligibility({
  poll,
  roleName,
  alreadyVoted,
  optionBelongsToPoll,
  now = new Date(),
}: VoteEligibilityInput) {
  if (roleName !== "usuario") {
    return { canVote: false, reason: "Tu rol no permite votar." };
  }

  if (poll.status !== "open") {
    return { canVote: false, reason: "La votacion no esta abierta." };
  }

  if (poll.starts_at && new Date(poll.starts_at) > now) {
    return { canVote: false, reason: "La votacion todavia no ha empezado." };
  }

  if (poll.ends_at && new Date(poll.ends_at) < now) {
    return { canVote: false, reason: "La votacion esta cerrada." };
  }

  if (alreadyVoted) {
    return { canVote: false, reason: "Ya has votado en esta votacion." };
  }

  if (!optionBelongsToPoll) {
    return { canVote: false, reason: "La opcion no pertenece a esta votacion." };
  }

  return { canVote: true, reason: null };
}
