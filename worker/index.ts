import { Hono, Context } from "hono";
import { getCookie, setCookie } from "hono/cookie";
import { logger } from "hono/logger";
import {
  DBData,
  LeaderboardData,
  ClaimToken,
  ServerSentWorkerData,
  ClientSentWorkerData,
  ErrorAbbrev,
  ClientSentWorkerDataReportAction,
  DBDataFull,
  sanitiseDBData,
  ClientSentWorkerDataTaxedAction,
  // @ts-expect-error
} from "../shared/types.d.ts";
import { CookieOptions } from "hono/utils/cookie";

const CLAIM_TOKEN = {
  LEN_B: 256,
  SEPARATOR: ".",
};

const TAXES_USER_IDENTIFIER = "taxes|user";

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
const IDENT_COOKIE_MAX_AGE = 60 ** 2 * 24 * 31 * 6;

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

  setCookie(
    c,
    IDENT_COOKIE_NAME,
    identifier,
    COOKIE_OPTS(IDENT_COOKIE_MAX_AGE),
  );

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
    case "leaderboard":
      const ldbdQuery = `
        select
          nickname,
          net_worth,
          ldbd_rank
        from (
          select
            identifier,
            nickname,
            net_worth,
            rank() over (order by net_worth desc) as ldbd_rank
          from savedat
        )
        where (ldbd_rank <= 15
           or identifier = ?1)
           and nickname != "<not given>"
        order by ldbd_rank asc;
      `.trim();

      const result = await c.env.DB.prepare(ldbdQuery).bind(identifier).run();

      if (result.error) {
        return c.json(
          sockData({
            success: false,
            error: {
              abbrev: "EQURY",
              message: `D1 returned an error: ${result.error}`,
            },
          }),
        );
      }

      return c.json(
        sockData({
          success: true,
          results: result.results as LeaderboardData[],
        }),
      );

      break;
    case "report":
      const query = `
        insert into savedat (identifier, encoded_save, nickname, net_worth)
        values (?1, ?2, ?3, ?4)
        on conflict(identifier) do update set
          encoded_save = excluded.encoded_save,
          nickname = excluded.nickname,
          net_worth = excluded.net_worth
        returning *;
      `.trim();

      try {
        let res: D1Result<Record<string, unknown>> = await c.env.DB.prepare(
          query,
        )
          .bind(
            identifier,
            (body as ClientSentWorkerDataReportAction).encodedSaveData,
            (body as ClientSentWorkerDataReportAction).nickname,
            (body as ClientSentWorkerDataReportAction).net_worth,
          )
          .run();

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

        const results = (res.results as DBDataFull[]).map((dirty) =>
          sanitiseDBData(dirty),
        );

        return c.json(
          sockData({
            success: true,
            results,
          }),
        );
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
    case "get":
      const getQuery = `
        select *
        from savedat
        where identifier = ?1;
      `.trim();

      const d1result = await c.env.DB.prepare(getQuery).bind(identifier).run();

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

      const results = (d1result.results as DBDataFull[]).map((dirty) =>
        sanitiseDBData(dirty),
      );

      return c.json(
        sockData({
          success: true,
          results,
        }),
      );
    case "taxed":
      const { amountPaid } = body as ClientSentWorkerDataTaxedAction;

      // Add the amount paid to the designated user

      const taxQuery = `
        update savedat
        set
          net_worth = net_worth + ?2
        where identifier = ?1;
      `.trim();

      try {
        let res: D1Result<Record<string, unknown>> = await c.env.DB.prepare(
          taxQuery,
        )
          .bind(TAXES_USER_IDENTIFIER, amountPaid)
          .run();

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

        const results = (res.results as DBDataFull[]).map((dirty) =>
          sanitiseDBData(dirty),
        );

        return c.json(
          sockData({
            success: true,
            results,
          }),
        );
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
  }
});

export default app;
