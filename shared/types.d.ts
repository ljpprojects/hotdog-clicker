export type DBDataFull = {
  identifier: string;
  encoded_save: string;
  nickname: string;
  net_worth: string;
};

export type DBData = {
  encoded_save: string;
  nickname: string;
  net_worth: string;
};

export type LeaderboardData = {
  nickname: string;
  net_worth: number;
  ldbd_rank: number;
};

export type ClaimToken = {
  token: { base64: string; raw: Uint8Array };
  keypair: CryptoKeyPair;
  tokenSignature: { base64: string; raw: Uint8Array };
  saveSignature: { base64: string; raw: Uint8Array };
};

export interface ClientSentWorkerData {
  action: "report" | "get" | "leaderboard" | "taxed" | "restore" | "ident";
}

export interface ClientSentWorkerDataReportAction extends ClientSentWorkerData {
  action: "report";
  encodedSaveData: string;
  nickname: string;
  netWorth: number;
}

export interface ClientSentWorkerDataTaxedAction extends ClientSentWorkerData {
  action: "taxed";
  amountPaid: number;
}

export interface ClientSentWorkerDataLeaderboardAction
  extends ClientSentWorkerData {
  action: "leaderboard";
}

export interface ClientSentWorkerDataGetAction extends ClientSentWorkerData {
  action: "get";
}

export interface ClientSentWorkerDataIdentAction extends ClientSentWorkerData {
  action: "ident";
}

export interface ClientSentWorkerDataRestoreAction
  extends ClientSentWorkerData {
  action: "restore";
  oldIdentifier: string;
}

export type ErrorAbbrev = "EAUTH" | "ESNTX" | "EQURY" | "EUNKN";

export interface ServerSentWorkerData {
  success: boolean;
  error?: {
    abbrev: ErrorAbbrev;
    message: string;
  };
  results?: DBData[] | LeaderboardData[];
  ident?: string;

  [name: string]: any;
}
