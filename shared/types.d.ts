export type DBData = {
  identifier: string;
  claimtk: string | null;
  encoded_save: string;
  nickname: string;
}

export type ClaimToken = {
  token: { base64: string, raw: Uint8Array };
  keypair: CryptoKeyPair;
  tokenSignature: { base64: string, raw: Uint8Array };
  saveSignature: { base64: string, raw: Uint8Array };
}

export interface ClientSentSocketData {
  action: "close" | "report" | "get" | "ping" | "claim";
}

export interface ClientSentSocketDataCloseAction extends ClientSentSocketData {
  action: "close";
}

export interface ClientSentSocketDataReportAction extends ClientSentSocketData {
  action: "report";
  encodedSaveData: string;
  nickname: string;
}

export interface ClientSentSocketDataGetAction extends ClientSentSocketData {
  action: "get";
}

export interface ClientSentSocketDataPingAction extends ClientSentSocketData {
  action: "ping";
}

export interface ClientSentSocketDataClaimAction extends ClientSentSocketData {
  action: "claim";
}

export type ErrorAbbrev =
  "EAUTH" |
  "ESNTX" |
  "EQURY" |
  "EUNKN"

export interface ServerSentSocketData {
  success: boolean,
  error?: {
    abbrev: ErrorAbbrev,
    message: string,
  },
  results?: DBData[]

  [name: string]: any
}
