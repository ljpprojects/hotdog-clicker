import { Hono, Context, TypedResponse } from "hono";
import { trimTrailingSlash } from 'hono/trailing-slash';
import { getCookie, setCookie } from "hono/cookie";
import { logger } from "hono/logger";
import type {
  DBData,
  LeaderboardData,
  ServerSentWorkerData,
  ClientSentWorkerData,
  ClientSentWorkerDataReportAction,
  DBDataFull,
  ClientSentWorkerDataRestoreAction,
} from "../shared/types.d.ts";

import { CookieOptions } from "hono/utils/cookie";
import { env } from "cloudflare:workers";
import { BlankInput } from "hono/types";

type SessionData = {
  identifier: string
}

const IDENT_COOKIE_NAME = "identifier";

const REFRESH_TOKEN_NAME = "rftk";
const REFRESH_TOKEN_MAX_AGE = 60 ** 2 * 24 * 31 * 6;

const SESSION_COOKIE_NAME = "session";
const SESSION_MAX_AGE = 60 * 30;

const COOKIE_OPTS: (age: number) => CookieOptions = (age: number) => {
  if (env.ENVIRONMENT.startsWith("prod:")) {
    return {
      httpOnly: true,
      sameSite: "Strict",
      maxAge: age,
      //secure: true,
      path: "/",
      //domain: env.ENVIRONMENT === "prod:release" ? 'https://hdc.ljpprojects.org' : 'https://dev.hdc.ljpprojects.org'
    }
  } else {
    return {
      httpOnly: true,
      sameSite: "Strict",
      maxAge: age,
      path: "/",
    }
  }
};

const KV_PUT_OPTS: KVNamespacePutOptions = {
  expirationTtl: SESSION_MAX_AGE,
  metadata: {
    environment: env.ENVIRONMENT
  }
}

const sanitiseDBData = (full: DBDataFull): DBData => {
  return {
    encoded_save: full.encoded_save,
    nickname: full.nickname,
    net_worth: full.net_worth
  } as DBData;
};

const workerData: (dat: ServerSentWorkerData) => ServerSentWorkerData = (dat) =>
  dat;

const app = new Hono<{ Bindings: Cloudflare.Env }>();

app.use(trimTrailingSlash());

console.log(env.ENVIRONMENT);
app.use(logger());

const createRefreshToken = (identifier: Uint8Array) => {
  if (identifier.length !== 32) {
    return null
  }

  // Identifier should be 32 bytes long

  const randomBytes = new Uint8Array(96);
  crypto.getRandomValues(randomBytes);

  const bytes = new Uint8Array(128);

  bytes.set(randomBytes, 0);
  bytes.set(identifier, 96);

  return bytes;
}

const checkRefreshToken = (refreshToken: Uint8Array) => {
  if (refreshToken.length !== 128) {
    return false
  }

  // refreshToken should be 128 bytes long

  const identifierBytes = refreshToken.slice(96);
  const identifierRegex = /^[a-zA-Z0-9+\/]{43}=$/;

  return identifierRegex.test(identifierBytes.toBase64());
}

const initSession = async (
  c: Context<{
    Bindings: Cloudflare.Env;
  }, string, BlankInput>,

  identifier: string
): Promise<[Response, string]> => {
  const bytes = new Uint8Array(128);
  crypto.getRandomValues(bytes);

  /*
  Examples:
  4upj481ZwuZXvLaByK/Oi9nbx8XtxTK+4Tu54pYz30EyJ6CFlf9wrLnH16oY2lanWSL6Fu2juM5sRyqoWZ7tJa3C8uaeoE1SYtxj27YUylcxeaWWsRhs2f+uYgMEe5AwetsFLynPdmzUFypYd3LCMZgl2V/K6M59TvQFD3tpTyU=
  mCQKmRBLn/25q6DbU5r4B70CEB83m7YiF75dalHZRUEab8f5IAnirnIP7/OO6YIWsg9Pr5GT85NpUGVLkc8p9PUqVYQPvWoKCSdb4W6S7fy+nHuYrN5gYcUwN/HH6CsKuCF99E91UIfg/IKZLJEcMuoqo78djepPa67kOb3Mthw=
  */
  const sessionCode = bytes.toBase64();

  // We have an identifier, so we need to create a new session
  await c.env.SESSIONS.put(`session:${sessionCode}`, JSON.stringify({
    identifier,
  } as SessionData), KV_PUT_OPTS);

  setCookie(
    c,
    SESSION_COOKIE_NAME,
    sessionCode,
    COOKIE_OPTS(SESSION_MAX_AGE)
  );

  const callback = c.req.query("callback");
  if (callback != null) {
    return [c.redirect(callback), sessionCode]
  }

  return [c.json(
    workerData({
      success: true,
    })
  ), sessionCode]
}

const checkSession = async (
  c: Context<{
    Bindings: Cloudflare.Env;
  }, string, BlankInput>,

  sessionCode: string
): Promise<SessionData | null> => {
  const identifierRegex = /^[a-zA-Z0-9+\/]{43}=$/;
  const sessionRegex = /^[a-zA-Z0-9+\/]{171}=$/;

  if (!sessionRegex.test(sessionCode)) {
    return null;
  }

  const sessionData = await env.SESSIONS.get<SessionData>(`session:${sessionCode}`, "json");
  if (sessionData == null) {
    return null;
  }

  if (!identifierRegex.test(sessionData.identifier)) {
    return null;
  }

  return sessionData
}

app.get("/auth", async (c) => {
  // Get the identifier cookie
  const maybeIdentifier = getCookie(c, IDENT_COOKIE_NAME);

  if (maybeIdentifier != null) {
    // Check if we have a refresh token
    const refreshToken = getCookie(c, REFRESH_TOKEN_NAME);
    if (refreshToken == null) {
      const newRefreshToken = createRefreshToken(Uint8Array.fromBase64(maybeIdentifier))!;

      // Set refresh token
      setCookie(
        c,
        REFRESH_TOKEN_NAME,
        newRefreshToken.toBase64(),
        COOKIE_OPTS(REFRESH_TOKEN_MAX_AGE)
      );
    }

    return (await initSession(c, maybeIdentifier))[0];
  }

  const session = getCookie(c, SESSION_COOKIE_NAME);
  if (session != null) {
    const sessionData = await checkSession(c, session);
    if (sessionData) {
      // Check if we have a refresh token
      const refreshToken = getCookie(c, REFRESH_TOKEN_NAME);
      if (refreshToken == null) {
        const newRefreshToken = createRefreshToken(Uint8Array.fromBase64(sessionData.identifier))!;

        // Set refresh token
        setCookie(
          c,
          REFRESH_TOKEN_NAME,
          newRefreshToken.toBase64(),
          COOKIE_OPTS(REFRESH_TOKEN_MAX_AGE)
        );
      }

      const callback = c.req.query("callback");
      if (callback != null) {
        return c.redirect(callback);
      }

      return c.json(
        workerData({
          success: true,
        })
      );
    }
  }

  // Last resort: check for a refresh token
  const refreshToken = getCookie(c, REFRESH_TOKEN_NAME);
  if (refreshToken != null) {
    const refreshTokenBytes = Uint8Array.fromBase64(refreshToken);
    if (checkRefreshToken(refreshTokenBytes)) {
      const identifier = refreshTokenBytes.slice(96, 128);

      console.log(identifier.toBase64());

      const newRefreshToken = createRefreshToken(identifier)!;

      // Rotate refresh token
      setCookie(
        c,
        REFRESH_TOKEN_NAME,
        newRefreshToken.toBase64(),
        COOKIE_OPTS(REFRESH_TOKEN_MAX_AGE)
      );

      return (await initSession(c, identifier.toBase64()))[0];
    }
  }

  const identifierBytes = new Uint8Array(32);
  crypto.getRandomValues(identifierBytes);

  const identifier = identifierBytes.toBase64();
  const newRefreshToken = createRefreshToken(identifierBytes)!;

  // Set refresh token
  setCookie(
    c,
    REFRESH_TOKEN_NAME,
    newRefreshToken.toBase64(),
    COOKIE_OPTS(REFRESH_TOKEN_MAX_AGE)
  );

  return (await initSession(c, identifier))[0];
});

app.post("/api", async (c) => {
  let body: ClientSentWorkerData;

  try {
    body = await c.req.json();
  } catch (e) {
    return c.json(
      workerData({
        success: false,
        error: {
          abbrev: "ESNTX",
          message: "JSON could not be parsed due to invalid syntax.",
        },
      }),
    );
  }

  const session = getCookie(c, SESSION_COOKIE_NAME);
  if (session == null) {
    return c.json(
      workerData({
        success: false,
        error: {
          abbrev: "EAUTH",
          message: "Must be authenticated to run an action.",
        },
      }),
    );
  }

  const sessionData = await checkSession(c, session);
  if (sessionData == null) {
    return c.json(
      workerData({
        success: false,
        error: {
          abbrev: "EAUTH",
          message: `Must be authenticated to run an action; your session ${session} is invalid.`,
        },
      }),
    );
  }

  const identifier = sessionData.identifier;

  // Check if we have a refresh token, and ensure we create one (everyone needs one!!!!)
  const refreshToken = getCookie(c, REFRESH_TOKEN_NAME);
  if (refreshToken == null) {
    const newRefreshToken = createRefreshToken(Uint8Array.fromBase64(identifier))!;

    // Set refresh token
    setCookie(
      c,
      REFRESH_TOKEN_NAME,
      newRefreshToken.toBase64(),
      COOKIE_OPTS(REFRESH_TOKEN_MAX_AGE)
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
          workerData({
            success: false,
            error: {
              abbrev: "EQURY",
              message: `D1 returned an error: ${result.error}`,
            },
          }),
        );
      }

      return c.json(
        workerData({
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
            (body as ClientSentWorkerDataReportAction).netWorth,
          )
          .run();

        if (res == null) {
          break;
        }

        if (res.error) {
          return c.json(
            workerData({
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
          workerData({
            success: true,
            results,
          }),
        );
      } catch (e) {
        return c.json(
          workerData({
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
          workerData({
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
        workerData({
          success: true,
          results,
        }),
      );

    case "restore":
      const { oldIdentifier } = body as ClientSentWorkerDataRestoreAction;

      // Set the session to have the old identifier
      env.SESSIONS.put(`session:${session}`, JSON.stringify({
        identifier: oldIdentifier,
      } as SessionData))

      return c.json(
        workerData({
          success: true,
        }),
      );

    case "ident":
      return c.json(
        workerData({
          success: true,
          ident: identifier,
        })
      )
  }
});

export default app;
