import { describe, expect, test } from "vitest";
import { getVoteEligibility } from "./vote-rules";

const openPoll = {
  status: "open" as const,
  starts_at: null,
  ends_at: null,
};

describe("getVoteEligibility", () => {
  test("allows a usuario to vote once on an open poll with a valid option", () => {
    expect(
      getVoteEligibility({
        poll: openPoll,
        roleName: "usuario",
        alreadyVoted: false,
        optionBelongsToPoll: true,
      }),
    ).toEqual({ canVote: true, reason: null });
  });

  test("blocks duplicate votes", () => {
    expect(
      getVoteEligibility({
        poll: openPoll,
        roleName: "usuario",
        alreadyVoted: true,
        optionBelongsToPoll: true,
      }),
    ).toEqual({ canVote: false, reason: "Ya has votado en esta votacion." });
  });

  test("blocks votes when the option is from another poll", () => {
    expect(
      getVoteEligibility({
        poll: openPoll,
        roleName: "usuario",
        alreadyVoted: false,
        optionBelongsToPoll: false,
      }),
    ).toEqual({ canVote: false, reason: "La opcion no pertenece a esta votacion." });
  });

  test("blocks lectores from voting", () => {
    expect(
      getVoteEligibility({
        poll: openPoll,
        roleName: "lector",
        alreadyVoted: false,
        optionBelongsToPoll: true,
      }),
    ).toEqual({ canVote: false, reason: "Tu rol no permite votar." });
  });
});
