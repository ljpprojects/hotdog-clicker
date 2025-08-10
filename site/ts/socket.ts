import { ServerSentSocketData, ClientSentSocketData, ClientSentSocketDataReportAction, ClientSentSocketDataCloseAction, ClientSentSocketDataGetAction, ClientSentSocketDataPingAction } from "../../shared/types"

const AUTH_REDIRECT_URL = `/auth?callback=${encodeURIComponent(window.location.href)}`

export const socket = new WebSocket("./socket")

export const generatePing = (): ClientSentSocketDataPingAction => ({
  action: 'ping'
})

export const generateGet = (): ClientSentSocketDataGetAction => ({
  action: 'get'
})

export const generateClose = (): ClientSentSocketDataCloseAction => ({
  action: 'close'
})

export const generateReport = (encodedSaveData: string, nickname: string): ClientSentSocketDataReportAction => ({
  action: 'report',
  encodedSaveData,
  nickname,
})

// try to get our save data and generate auth token if needed

const dbdat = socket.send(JSON.stringify(generateGet()))
