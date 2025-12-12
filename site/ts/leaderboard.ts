import { LeaderboardData } from "../../shared/types";
import { generateLeaderboard, makeWorkerReq } from "./worker/interfacing";
import { leaderboardElements, youLeaderboardElement } from "./elements";
import { formatter } from "./game";
import { isValidNickname, MAX_NICKNAME_LENGTH } from "./nickname";
import { Mode, ModeBasedAction } from "./mode";

export const leaderboard = () => new Promise<{
  nickname: string;
  net_worth: number;
  ldbd_rank: number;
}[]>(async (res, rej) => {
  ModeBasedAction.empty()
    .actionFor([Mode.TRANSITION_MODE, Mode.FREEZE_MODE], () => rej("In a mode which does not allow leaderboard updates."))
    .do();

  const req = generateLeaderboard();
  const dat = await makeWorkerReq(req);

  if (!dat.success && dat.error) {
    console.error(`${dat.error}`);

    return [];
  }

  const ldbd = (dat.results as LeaderboardData[]).flatMap((entry) => {
    if (!isValidNickname(entry.nickname)) {
      return [];
    }

    return {
      ...entry,
      nickname: entry.nickname.slice(0, MAX_NICKNAME_LENGTH),
    } satisfies LeaderboardData;
  });

  res(ldbd);
});

export const updateLeaderboard = () => new Promise<void>(async (res, rej) => {
  ModeBasedAction.empty()
    .actionFor([Mode.TRANSITION_MODE, Mode.FREEZE_MODE], () => rej("In a mode which does not allow leaderboard updates."))
    .do();

  const ldbd = await leaderboard();

  for (const element of leaderboardElements.slice(ldbd.length)) {
    element.classList.add("hide")
  }

  console.log(ldbd.length)

  for (const [rank, element] of leaderboardElements.slice(0, ldbd.length).entries()) {
    element.classList.remove("hide")
    element.textContent = `${ldbd[rank].nickname} — ${formatter.value.format(ldbd[rank].net_worth)}`;
  }

  const youLdbd = ldbd[ldbd.length - 1];

  if (youLdbd.ldbd_rank <= leaderboardElements.length) {
    youLeaderboardElement.classList.add("hide");
  } else {
    youLeaderboardElement.classList.remove("hide");
    youLeaderboardElement.value = youLdbd.ldbd_rank;
    youLeaderboardElement.textContent = `You (actual rank) — ${formatter.value.format(youLdbd.net_worth)}`;
  }

  res()
});
