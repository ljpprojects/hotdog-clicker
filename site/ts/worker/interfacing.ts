import type {
  ServerSentWorkerData,
  ClientSentWorkerData,
  ClientSentWorkerDataReportAction,
  ClientSentWorkerDataGetAction,
  ClientSentWorkerDataLeaderboardAction,
  ClientSentWorkerDataTaxedAction,
  ClientSentWorkerDataRestoreAction,
  ClientSentWorkerDataIdentAction
} from "../../../shared/types.d.ts";

export const AUTH_REDIRECT_URL = `/auth?callback=${encodeURIComponent(window.location.href)}`;

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

export const generateTaxed = (
  amountPaid: number,
): ClientSentWorkerDataTaxedAction => ({
  action: "taxed",
  amountPaid,
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
  return await fetch("/action", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(action),
  }).then(h => h.json());
};
