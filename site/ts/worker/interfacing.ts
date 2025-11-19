import type {
  ServerSentWorkerData,
  ClientSentWorkerData,
  ClientSentWorkerDataReportAction,
  ClientSentWorkerDataGetAction,
  ClientSentWorkerDataLeaderboardAction,
  ClientSentWorkerDataRestoreAction,
  ClientSentWorkerDataIdentAction
} from "../../../shared/types.d.ts";
import { Mode, ModeBasedAction } from "../mode.js";

export const API_PATH = "/api";

export const generateGet = (): ClientSentWorkerDataGetAction => ({
  action: "get",
});

export const generateLeaderboard =
  (): ClientSentWorkerDataLeaderboardAction => ({ action: "leaderboard" });

export const generateReport = (
  encodedSaveData: string,
  nickname: string,
  netWorth: number,
): ClientSentWorkerDataReportAction => ({
  action: "report",
  encodedSaveData,
  nickname,
  netWorth: netWorth,
});

export const generateRestore = (
  oldIdentifier: string,
): ClientSentWorkerDataRestoreAction => ({
  action: "restore",
  oldIdentifier,
});

export const generateIdent = (): ClientSentWorkerDataIdentAction => ({
  action: "ident",
});

export const makeWorkerReq = async (
  action: ClientSentWorkerData,
): Promise<ServerSentWorkerData> => {
  return new Promise(async (res, rej) => {
    await ModeBasedAction.empty<Promise<void>>()
      .actionForAllBut([Mode.TRANSITION_MODE], async () => res(await fetch(API_PATH, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(action),
      }).then(h => h.json())))
      .transitionAction(async () => rej("In mode which does not allow requests to the backend."))
      .do();
  })
};
