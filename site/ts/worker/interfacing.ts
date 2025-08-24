import {
  ServerSentWorkerData,
  ClientSentWorkerData,
  ClientSentWorkerDataReportAction,
  ClientSentWorkerDataGetAction,
  ClientSentWorkerDataLeaderboardAction,
} from "../../../shared/types";

export const AUTH_REDIRECT_URL = `/auth?callback=${encodeURIComponent(window.location.href)}`;

export const generateGet = (): ClientSentWorkerDataGetAction => ({ action: "get" });

export const generateLeaderboard = (): ClientSentWorkerDataLeaderboardAction => ({ action: "leaderboard" });

export const generateReport = (
  encodedSaveData: string,
  nickname: string,
  netWorth: number,
): ClientSentWorkerDataReportAction => ({
  action: "report",
  encodedSaveData,
  nickname,
  net_worth: netWorth,
});

export const makeWorkerReq = async (
  action: ClientSentWorkerData,
): Promise<ServerSentWorkerData> => {
  const headers = await fetch("/action", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(action),
  });

  const response = await headers.json();

  return response;
};
