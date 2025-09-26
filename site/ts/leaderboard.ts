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

export const handleLdbd = async () => {
  const ldbd = await leaderboard();

  for (const element of leaderboardElements.slice(ldbd.length)) {
    element.classList.add("hide")
  }

  for (const [index, element] of leaderboardElements.slice(0, ldbd.length).entries()) {
    element.classList.remove("hide")
    element.textContent = `${ldbd[index].nickname} — ${formatter.value.format(ldbd[index].net_worth)}`;
  }

  const youLdbd = ldbd[ldbd.length - 1];

  if (youLdbd.ldbd_rank <= 15) {
    youLeaderboardElement.classList.add("hide");
  } else {
    youLeaderboardElement.classList.remove("hide");
    youLeaderboardElement.value = youLdbd.ldbd_rank;
    youLeaderboardElement.textContent = `You (${youLdbd.nickname}) — ${formatter.value.format(youLdbd.net_worth)}`;
  }
};
