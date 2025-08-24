import { LeaderboardData } from "../../shared/types";
import { generateLeaderboard, makeWorkerReq } from "./worker/interfacing"

export const leaderboard = async () => {
  const req = generateLeaderboard();
  const res = await makeWorkerReq(req);

  if (!res.success && res.error) {
    console.error(`${res.error}`)

    return []
  }

  const ldbd = res.results as LeaderboardData[]

  return ldbd.sort((a, b) => a.ldbd_rank - b.ldbd_rank)
}
