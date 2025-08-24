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
}

export const sanitiseDBData = (full: DBDataFull): DBData => {
  const sanitised: DBDataFull = structuredClone(full);

  delete sanitised.identifier;

  return sanitised as DBData
}

export type ClaimToken = {
  token: { base64: string; raw: Uint8Array };
  keypair: CryptoKeyPair;
  tokenSignature: { base64: string; raw: Uint8Array };
  saveSignature: { base64: string; raw: Uint8Array };
};

export interface ClientSentWorkerData {
  action: "report" | "get" | "leaderboard";
}

export interface ClientSentWorkerDataReportAction extends ClientSentWorkerData {
  action: "report";
  encodedSaveData: string;
  nickname: string;
  net_worth: number;
}

export interface ClientSentWorkerDataLeaderboardAction extends ClientSentWorkerData {
  action: "leaderboard";
}

export interface ClientSentWorkerDataGetAction extends ClientSentWorkerData {
  action: "get";
}

export type ErrorAbbrev = "EAUTH" | "ESNTX" | "EQURY" | "EUNKN" | "ECLMR";

export interface ServerSentWorkerData {
  success: boolean;
  error?: {
    abbrev: ErrorAbbrev;
    message: string;
  };
  results?: DBData[] | LeaderboardData[];

  [name: string]: any;
}
