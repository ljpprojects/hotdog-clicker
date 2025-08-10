import { Hono, Context } from 'hono';
import { getCookie, setCookie } from 'hono/cookie';
import { upgradeWebSocket } from 'hono/cloudflare-workers'
import { logger } from 'hono/logger'
import { BlankInput } from 'hono/types';
import { DBData, ClaimToken, ServerSentSocketData, ClientSentSocketData, ErrorAbbrev, ClientSentSocketDataReportAction } from '../shared/types'

const CLAIM_TOKEN = {
  LEN_B: 256,
  SEPARATOR: "."
}

/**
 * Formats a claim token.
 * ## Format
 * [signature].[save-signature].[token]
 * All components are base64 encoded.
 *
 * @param claimToken The claim token to format
 * @returns An object with the formatted token string and the PEM file for the signature's public key.
 */
const formatClaimToken = async (claimToken: ClaimToken): Promise<{ tokenstr: string, pemkey: string }> => {
  return {
    pemkey: `-----BEGIN PUBLIC KEY-----\n${base64Encode(new Uint8Array(await crypto.subtle.exportKey("spki", claimToken.keypair.publicKey)))}\n-----END PUBLIC KEY-----`,
    tokenstr: `${claimToken.tokenSignature.base64}${CLAIM_TOKEN.SEPARATOR}${claimToken.saveSignature.base64}${CLAIM_TOKEN.SEPARATOR}${claimToken.token.base64}`
  }
}

const base64Encode = (bytes: Uint8Array): string => btoa(String.fromCharCode(...bytes))

const generateClaimToken = async (encodedSave: string): Promise<ClaimToken> => {
  const bytes = new Uint8Array(CLAIM_TOKEN.LEN_B)
  crypto.getRandomValues(bytes);

  const sigKeyPair = await crypto.subtle.generateKey({
    name: "ECDSA",
    namedCurve: "P-521"
  } satisfies EcKeyGenParams, true, ["sign", "verify"])

  const sigAlgorithm: EcdsaParams = {
    name: "ECDSA",
    hash: { name: "SHA-512" }
  }

  const saveBytes = Uint8Array.from(encodedSave)

  const sigBytes = new Uint8Array(await crypto.subtle.sign(sigAlgorithm, sigKeyPair.privateKey, bytes))
  const saveSigBytes = new Uint8Array(await crypto.subtle.sign(sigAlgorithm, sigKeyPair.privateKey, saveBytes))

  // Verify signatures
  if (!await crypto.subtle.verify(sigAlgorithm, sigKeyPair.publicKey, sigBytes, bytes)) {
    throw "Signature of claim token "
  }

  if (!await crypto.subtle.verify(sigAlgorithm, sigKeyPair.publicKey, saveSigBytes, saveBytes)) {
    throw "Signature of claim token "
  }

  return {
    token: { base64: base64Encode(bytes), raw: bytes },
    tokenSignature: { base64: base64Encode(sigBytes), raw: sigBytes },
    saveSignature: { base64: base64Encode(saveSigBytes), raw: saveSigBytes },
    keypair: sigKeyPair,
  }
}

let SECRET: Uint8Array<ArrayBuffer> | null = null;

const COOKIE_NAME = "identifier";

type Bindings = {
  DB: D1Database;
};

const sockData: (dat: ServerSentSocketData) => string = JSON.stringify

const app = new Hono<{ Bindings: Bindings }>();

app.use(async (_, next) => {
  if (SECRET == null) {
    SECRET = new Uint8Array(48)
    crypto.getRandomValues(SECRET);
  }

  await next()
})
app.use(logger())

app.get('/auth', async (c) => {
  const bytes = new Uint8Array(32)
  crypto.getRandomValues(bytes);

  const identifier = btoa(String.fromCharCode(...bytes))

  setCookie(c, COOKIE_NAME, identifier, {
    httpOnly: true,
    sameSite: "Strict",
    maxAge: 60 * 30,
    // secure: true,
    // prefix: "secure",
    path: "/",
    // domain: "hdc.ljpprojects.org"
  })

  const callback = c.req.query("callback");

  if (callback) {
    return c.redirect(callback)
  }

  return c.json({
    success: true,
  })
});

app.get('/session', upgradeWebSocket(async (c: Context<{
  Bindings: Bindings;
}, "/session", BlankInput>) => {
  return {
    async onMessage(event, ws) {
      let body: ClientSentSocketData

      try {
        body = JSON.parse(event.data.toString())
      } catch (e) {
        ws.send(sockData({
          success: false,
          error: {
            abbrev: "ESNTX",
            message: "JSON could not be parsed due to invalid syntax."
          }
        }), { compress: true })

        return
      }

      const identifier = getCookie(c, COOKIE_NAME)

      if (!identifier) {
        ws.send(sockData({
          success: false,
          error: {
            abbrev: "EAUTH",
            message: "Must be authenticated to create a WebSocket session."
          },
        }), { compress: true })

        return
      }

      switch (body.action) {
        case "close":
          ws.close()

          break
        case "report":
          const query = `
            INSERT INTO savedat (identifier, claimtk, pubkey, encoded_save, nickname)
            VALUES (?1, ?4, ?5, ?2, ?3)
            ON CONFLICT(identifier) DO UPDATE SET
              encoded_save = excluded.encoded_save,
              nickname = excluded.nickname;
          `.trim();

          try {
            const claimtk = await generateClaimToken((body as ClientSentSocketDataReportAction).encodedSaveData);
            const pubkey = base64Encode(new Uint8Array(await crypto.subtle.exportKey("spki", claimtk.keypair.publicKey)))

            const { tokenstr, pemkey: _ } = await formatClaimToken(claimtk);

            ws.send(sockData({
              success: true,
              data: [identifier, (body as ClientSentSocketDataReportAction).encodedSaveData, (body as ClientSentSocketDataReportAction).nickname, tokenstr, pubkey]
            }))

            const res = await c.env.DB.prepare(query).bind(identifier, (body as ClientSentSocketDataReportAction).encodedSaveData, (body as ClientSentSocketDataReportAction).nickname, tokenstr, pubkey).run().catch(e => {
              ws.send(sockData({
                success: false,
                error: {
                  abbrev: "EQURY",
                  message: `D1 returned an error: ${e}`
                }
              }), { compress: true })

              return null
            })

            if (res == null) {
              break
            }

            if (res.error) {
              ws.send(sockData({
                success: false,
                error: {
                  abbrev: "EQURY",
                  message: `D1 returned an error: ${res.error}`
                }
              }), { compress: true })

              break
            }

            ws.send(sockData({
              success: true,
            }), { compress: true })

            break
          } catch (e) {
            ws.send(sockData({
              success: false,
              error: {
                abbrev: "EUNKN",
                message: `Unknown error encountered: ${e}`
              }
            }), { compress: true })
          }
        case "get":
          const saveQuery = "SELECT * FROM savedat WHERE identifier = ?;";
          const d1result = (await c.env.DB.prepare(saveQuery).bind(identifier).run());

          if (d1result.error) {
            ws.send(sockData({
              success: false,
              error: {
                abbrev: "EQURY",
                message: `D1 returned an error: ${d1result.error}`
              }
            }), { compress: true })
          }

          const results = d1result.results as DBData[]

          ws.send(sockData({
            success: true,
            results
          }), { compress: true })

          break
        case "ping":
          ws.send(JSON.stringify({
            success: true,
          }), { compress: true })
          break
      }
    }
  }
}))

export default app;
