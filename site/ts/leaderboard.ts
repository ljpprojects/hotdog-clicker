import { LeaderboardData } from "../../shared/types";
import { generateLeaderboard, makeWorkerReq } from "./worker/interfacing";

export const MAX_NICKNAME_LENGTH = 15;

export const isValidNickname = (nickname: string) => {
  console.log(nickname, nickname.trim(), nickname.trim.length)

  return nickname.trim().length > 0;
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
