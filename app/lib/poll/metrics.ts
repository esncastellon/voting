export function calculateParticipationRate({
  totalVotes,
  eligibleUsers,
  pollCount,
}: {
  totalVotes: number;
  eligibleUsers: number;
  pollCount: number;
}) {
  const denominator = eligibleUsers * pollCount;
  if (denominator === 0) return 0;
  return Math.round((totalVotes / denominator) * 100);
}
