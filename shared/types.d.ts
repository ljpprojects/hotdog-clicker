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

export interface ClientSentWorkerData {
  action: "report" | "get" | "leaderboard" | "restore" | "ident";
}

export interface ClientSentWorkerDataReportAction extends ClientSentWorkerData {
  action: "report";
  encodedSaveData: string;
  nickname: string;
  netWorth: number;
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
