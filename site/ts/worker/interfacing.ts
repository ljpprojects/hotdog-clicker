import {
  ServerSentWorkerData,
  ClientSentWorkerData,
  ClientSentWorkerDataReportAction,
  ClientSentWorkerDataGetAction,
  ClientSentWorkerDataPingAction,
  ClientSentWorkerDataClaimAction,
} from "../../../shared/types";

const AUTH_REDIRECT_URL = `/auth?callback=${encodeURIComponent(window.location.href)}`;

export const generateGet = (): ClientSentWorkerDataGetAction => ({
  action: "get",
});

export const generateClaim = (): ClientSentWorkerDataClaimAction => ({
  action: "claim",
});

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

// Try to get our save data and authenticate if needed

export const initialise = async () => {
  const res = await makeWorkerReq(generateGet());

  if (!res.success) {
    if (res.error?.abbrev === "EAUTH") {
      window.location.href = AUTH_REDIRECT_URL;
    }
  }
};
