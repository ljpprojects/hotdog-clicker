import { LeaderboardData } from "../../shared/types";
import { generateLeaderboard, makeWorkerReq } from "./worker/interfacing";
import { PLACEHOLDER_NICKNAME } from "./save";

export const MAX_NICKNAME_LENGTH = 15;

export const isValidNickname = (nickname: string) => {
  return nickname.trim().length > 0 && nickname !== PLACEHOLDER_NICKNAME;
};

export const leaderboard = async () => {
  const req = generateLeaderboard();
  const res = await makeWorkerReq(req);

  if (!res.success && res.error) {
    console.error(`${res.error}`);

    return [];
  }

  const ldbd = (res.results as LeaderboardData[]).filter((entry) =>
    isValidNickname(entry.nickname.slice(MAX_NICKNAME_LENGTH)),
  );

  return ldbd.sort((a, b) => a.ldbd_rank - b.ldbd_rank);
};
