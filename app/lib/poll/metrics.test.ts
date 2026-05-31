import { describe, expect, test } from "vitest";
import { calculateParticipationRate } from "./metrics";

describe("calculateParticipationRate", () => {
  test("returns zero when there are no eligible users or polls", () => {
    expect(calculateParticipationRate({ totalVotes: 5, eligibleUsers: 0, pollCount: 3 })).toBe(0);
    expect(calculateParticipationRate({ totalVotes: 5, eligibleUsers: 4, pollCount: 0 })).toBe(0);
  });

  test("calculates votes over eligible user-poll opportunities", () => {
    expect(calculateParticipationRate({ totalVotes: 6, eligibleUsers: 4, pollCount: 3 })).toBe(50);
  });
});
