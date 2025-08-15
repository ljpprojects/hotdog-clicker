import {
  ServerSentWorkerData,
  ClientSentWorkerData,
  ClientSentWorkerDataReportAction,
  ClientSentWorkerDataCloseAction,
  ClientSentWorkerDataGetAction,
  ClientSentWorkerDataPingAction,
  ClientSentWorkerDataClaimAction,
} from "../../../shared/types";

const AUTH_REDIRECT_URL = `/auth?callback=${encodeURIComponent(window.location.href)}`;

export const generatePing = (): ClientSentWorkerDataPingAction => ({
  action: "ping",
});

export const generateGet = (): ClientSentWorkerDataGetAction => ({
  action: "get",
});

export const generateClose = (): ClientSentWorkerDataCloseAction => ({
  action: "close",
});

export const generateClaim = (): ClientSentWorkerDataClaimAction => ({
  action: "claim",
});

export const generateReport = (
  encodedSaveData: string,
  nickname: string,
): ClientSentWorkerDataReportAction => ({
  action: "report",
  encodedSaveData,
  nickname,
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

(async () => {
  const res = await makeWorkerReq(generateGet());

  if (!res.success) {
    if (res.error?.message === "EAUTH") {
      // Just hope this redirects automatically?
      await fetch(AUTH_REDIRECT_URL);
    }
  }

  console.log(res);
})();
