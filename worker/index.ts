import { Hono, Context } from "hono";
import { getCookie, setCookie } from "hono/cookie";
import { logger } from "hono/logger";
import { BlankInput } from "hono/types";
import {
  DBData,
  ClaimToken,
  ServerSentWorkerData,
  ClientSentWorkerData,
  ErrorAbbrev,
  ClientSentWorkerDataReportAction,
} from "../shared/types";
import { CookieOptions } from "hono/utils/cookie";

const CLAIM_TOKEN = {
  LEN_B: 256,
  SEPARATOR: ".",
};

/**
 * Formats a claim token.
 * ## Format
 * [signature].[save-signature].[token]
 * All components are base64 encoded.
 *
 * @param claimToken The claim token to format
 * @returns An object with the formatted token string and the PEM file for the signature's public key.
 */
const formatClaimToken = async (
  claimToken: ClaimToken,
): Promise<{ tokenstr: string; pemkey: string }> => {
  return {
    pemkey: `-----BEGIN PUBLIC KEY-----\n${base64Encode(new Uint8Array(await crypto.subtle.exportKey("spki", claimToken.keypair.publicKey)))}\n-----END PUBLIC KEY-----`,
    tokenstr: `${claimToken.tokenSignature.base64}${CLAIM_TOKEN.SEPARATOR}${claimToken.saveSignature.base64}${CLAIM_TOKEN.SEPARATOR}${claimToken.token.base64}`,
  };
};

const base64Encode = (bytes: Uint8Array): string =>
  btoa(String.fromCharCode(...bytes));

const generateClaimToken = async (encodedSave: string): Promise<ClaimToken> => {
  const bytes = new Uint8Array(CLAIM_TOKEN.LEN_B);
  crypto.getRandomValues(bytes);

  const sigKeyPair = await crypto.subtle.generateKey(
    {
      name: "ECDSA",
      namedCurve: "P-521",
    } satisfies EcKeyGenParams,
    true,
    ["sign", "verify"],
  );

  const sigAlgorithm: EcdsaParams = {
    name: "ECDSA",
    hash: { name: "SHA-512" },
  };

  const saveBytes = Uint8Array.from(encodedSave);

  const sigBytes = new Uint8Array(
    await crypto.subtle.sign(sigAlgorithm, sigKeyPair.privateKey, bytes),
  );
  const saveSigBytes = new Uint8Array(
    await crypto.subtle.sign(sigAlgorithm, sigKeyPair.privateKey, saveBytes),
  );

  // Verify signatures
  if (
    !(await crypto.subtle.verify(
      sigAlgorithm,
      sigKeyPair.publicKey,
      sigBytes,
      bytes,
    ))
  ) {
    throw "Signature of claim token ";
  }

  if (
    !(await crypto.subtle.verify(
      sigAlgorithm,
      sigKeyPair.publicKey,
      saveSigBytes,
      saveBytes,
    ))
  ) {
    throw "Signature of claim token ";
  }

  return {
    token: { base64: base64Encode(bytes), raw: bytes },
    tokenSignature: { base64: base64Encode(sigBytes), raw: sigBytes },
    saveSignature: { base64: base64Encode(saveSigBytes), raw: saveSigBytes },
    keypair: sigKeyPair,
  };
};

let SECRET: Uint8Array<ArrayBuffer> | null = null;

const IDENT_COOKIE_NAME = "identifier";
const IDENT_COOKIE_MAX_AGE = 60 * 10;

const CLMTK_COOKIE_NAME = "claimtk";
const CLMTK_COOKIE_MAX_AGE = 60 ** 2 * 24 * 31 * 6;

const COOKIE_OPTS: (age: number) => CookieOptions = (age: number) => ({
  httpOnly: true,
  sameSite: "Strict",
  maxAge: age,
  //secure: true,
  //prefix: "secure",
  path: "/",
  // domain: "hdc.ljpprojects.org"
});

type Bindings = {
  DB: D1Database;
};

const sockData: (dat: ServerSentWorkerData) => ServerSentWorkerData = (dat) =>
  dat;

const app = new Hono<{ Bindings: Bindings }>();

app.use(async (_, next) => {
  if (SECRET == null) {
    SECRET = new Uint8Array(48);
    crypto.getRandomValues(SECRET);
  }

  await next();
});
app.use(logger());

app.get("/auth", async (c) => {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);

  const identifier = btoa(String.fromCharCode(...bytes));

  setCookie(c, IDENT_COOKIE_NAME, identifier, COOKIE_OPTS(IDENT_COOKIE_MAX_AGE));

  const callback = c.req.query("callback");

  if (callback) {
    return c.redirect(callback);
  }

  return c.json({
    success: true,
  });
});

app.post("/action", async (c) => {
  let body: ClientSentWorkerData;

  try {
    body = await c.req.json();
  } catch (e) {
    return c.json(
      sockData({
        success: false,
        error: {
          abbrev: "ESNTX",
          message: "JSON could not be parsed due to invalid syntax.",
        },
      }),
    );
  }

  const identifier = getCookie(c, IDENT_COOKIE_NAME);
  const claimtk = getCookie(c, CLMTK_COOKIE_NAME)

  if (!identifier) {
    return c.json(
      sockData({
        success: false,
        error: {
          abbrev: "EAUTH",
          message: "Must be authenticated to run an action.",
        },
      }),
    );
  }

  switch (body.action) {
    case "report":
      const query = `
      INSERT INTO savedat (identifier, claimtk, verifykey, encoded_save, nickname, net_worth)
      VALUES (?1, ?4, ?5, ?2, ?3, ?6)
      ON CONFLICT(identifier) DO UPDATE SET
        encoded_save = excluded.encoded_save,
        nickname = excluded.nickname,
        net_worth = excluded.net_worth,
        claimtk = excluded.claimtk,
        verifykey = excluded.verifykey;
    `.trim();

      try {
        const claimtk = await generateClaimToken(
          (body as ClientSentWorkerDataReportAction).encodedSaveData,
        );

        const pubkey = base64Encode(
          new Uint8Array(
            await crypto.subtle.exportKey("spki", claimtk.keypair.publicKey),
          ),
        );

        const { tokenstr, pemkey: _ } = await formatClaimToken(claimtk);

        let res: D1Result<Record<string, unknown>>;

        try {
          res = await c.env.DB.prepare(query)
            .bind(
              identifier,
              (body as ClientSentWorkerDataReportAction).encodedSaveData,
              (body as ClientSentWorkerDataReportAction).nickname,
              tokenstr,
              pubkey,
              btoa(
                (body as ClientSentWorkerDataReportAction).net_worth.toString(),
              ),
            )
            .run();

          setCookie(c, CLMTK_COOKIE_NAME, tokenstr, COOKIE_OPTS(CLMTK_COOKIE_MAX_AGE));
        } catch (e) {
          return c.json(
            sockData({
              success: false,
              error: {
                abbrev: "EQURY",
                message: `D1 returned an error: ${e}`,
              },
            }),
          );
        }

        if (res == null) {
          break;
        }

        if (res.error) {
          return c.json(
            sockData({
              success: false,
              error: {
                abbrev: "EQURY",
                message: `D1 returned an error: ${res.error}`,
              },
            }),
          );

          break;
        }

        return c.json(
          sockData({
            success: true,
          }),
        );
      } catch (e) {
        return c.json(
          sockData({
            success: false,
            error: {
              abbrev: "EUNKN",
              message: `Unknown error encountered: ${e}`,
            },
          }),
        );
      }
    case "get":
      const saveQuery = "SELECT * FROM savedat WHERE identifier = ?1 OR claimtk = ?2;";
      const d1result = await c.env.DB.prepare(saveQuery).bind(identifier, claimtk ?? "").run();

      if (d1result.error) {
        return c.json(
          sockData({
            success: false,
            error: {
              abbrev: "EQURY",
              message: `D1 returned an error: ${d1result.error}`,
            },
          }),
        );
      }

      const results = d1result.results as DBData[];

      if (
        claimtk &&
        results[0] &&
        d1result.results[0].claimtk &&
        results[0].identifier !== identifier &&
        d1result.results[0].claimtk == claimtk
      ) {
        return c.json(
          sockData({
            success: false,
            error: {
              abbrev: "ECLMR",
              message: "A claim is required to access the data."
            },
          }),
        );
      }

      console.log(d1result.results[0])

      if (
        claimtk &&
        d1result.results[0]
      ) {
        setCookie(c, CLMTK_COOKIE_NAME, d1result.results[0].claimtk as string, COOKIE_OPTS(CLMTK_COOKIE_MAX_AGE));
      }

      return c.json(
        sockData({
          success: true,
          results,
        }),
      );

      break;
    case "claim":
      const claimtkquery = `
        UPDATE savedat
        SET identifier = ?1
        WHERE claimtk = ?2;
      `.trim();

      let res: D1Result<Record<string, unknown>>;

      try {
        res = await c.env.DB.prepare(claimtkquery)
          .bind(identifier, getCookie(c, CLMTK_COOKIE_NAME))
          .run();
      } catch (e) {
        return c.json(
          sockData({
            success: false,
            error: {
              abbrev: "EQURY",
              message: `D1 returned an error: ${e}`,
            },
          }),
        );
      }

      if (res == null) {
        break;
      }

      if (res.error) {
        return c.json(
          sockData({
            success: false,
            error: {
              abbrev: "EQURY",
              message: `D1 returned an error: ${res.error}`,
            },
          }),
        );

        break;
      }

      return c.json(
        sockData({
          success: true,
        }),
      );
  }
});

export default app;
