import { LeaderboardData } from "../../shared/types";
import { generateLeaderboard, makeWorkerReq } from "./worker/interfacing";
import { leaderboardElements, youLeaderboardElement } from "./elements";
import { formatter } from "./game";
import { isValidNickname, MAX_NICKNAME_LENGTH } from "./nickname";

export const leaderboard = async () => {
  const req = generateLeaderboard();
  const res = await makeWorkerReq(req);

  if (!res.success && res.error) {
    console.error(`${res.error}`);

    return [];
  }

  const ldbd = (res.results as LeaderboardData[]).flatMap((entry) => {
    if (!isValidNickname(entry.nickname)) {
      return [];
    }

    return {
      ...entry,
      nickname: entry.nickname.slice(0, MAX_NICKNAME_LENGTH),
    } satisfies LeaderboardData;
  });

  return ldbd;
};

export const updateLeaderboard = async () => {
  const ldbd = await leaderboard();

  for (const element of leaderboardElements.slice(ldbd.length)) {
    element.classList.add("hide")
  }

  let youAreOnLdbd = false;

  for (const [rank, element] of leaderboardElements.slice(0, ldbd.length).entries()) {
    element.classList.remove("hide")
    element.textContent = `${ldbd[rank].nickname} — ${formatter.value.format(ldbd[rank].net_worth)}`;
  }

  const youLdbd = ldbd[ldbd.length - 1];

  if (youLdbd.ldbd_rank <= 15) {
    youLeaderboardElement.classList.add("hide");
  } else {
    youLeaderboardElement.classList.remove("hide");
    youLeaderboardElement.value = youLdbd.ldbd_rank;
    youLeaderboardElement.textContent = `You (actual rank) — ${formatter.value.format(youLdbd.net_worth)}`;
  }
};
