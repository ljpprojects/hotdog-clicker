export type DBData = {
  identifier: string;
  claimtk: string | null;
  encoded_save: string;
  nickname: string;
};

export type ClaimToken = {
  token: { base64: string; raw: Uint8Array };
  keypair: CryptoKeyPair;
  tokenSignature: { base64: string; raw: Uint8Array };
  saveSignature: { base64: string; raw: Uint8Array };
};

export interface ClientSentWorkerData {
  action: "close" | "report" | "get" | "ping" | "claim";
}

export interface ClientSentWorkerDataCloseAction extends ClientSentWorkerData {
  action: "close";
}

export interface ClientSentWorkerDataReportAction extends ClientSentWorkerData {
  action: "report";
  encodedSaveData: string;
  nickname: string;
}

export interface ClientSentWorkerDataGetAction extends ClientSentWorkerData {
  action: "get";
}

export interface ClientSentWorkerDataPingAction extends ClientSentWorkerData {
  action: "ping";
}

export interface ClientSentWorkerDataClaimAction extends ClientSentWorkerData {
  action: "claim";
}

export type ErrorAbbrev = "EAUTH" | "ESNTX" | "EQURY" | "EUNKN";

export interface ServerSentWorkerData {
  success: boolean;
  error?: {
    abbrev: ErrorAbbrev;
    message: string;
  };
  results?: DBData[];

  [name: string]: any;
}
