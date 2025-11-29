import { Hono, Context, TypedResponse } from "hono";
import { trimTrailingSlash } from 'hono/trailing-slash'
import { cors } from 'hono/cors';
import { csrf } from 'hono/csrf';
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
import { ContentfulStatusCode } from "hono/utils/http-status.js";
import { BlankInput } from "hono/types";

type SessionData = {
  identifier: string
}

const IDENT_COOKIE_NAME = "identifier";
const IDENT_COOKIE_MAX_AGE = 60 ** 2 * 24 * 31 * 6;

const SESSION_COOKIE_NAME = "session";
const SESSION_MAX_AGE = 60 ** 2 * 30;

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

const KV_PUT_OPTS: (identifier: string) => KVNamespacePutOptions = (identifier) => {
  return {
    expirationTtl: SESSION_MAX_AGE,
    metadata: {
      environment: env.ENVIRONMENT
    }
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

if (env.ENVIRONMENT.startsWith("prod:")) {
  app.use(cors({
    origin: "*",//env.ENVIRONMENT === "prod:release" ? 'https://hdc.ljpprojects.org' : 'https://dev.hdc.ljpprojects.org',
    allowMethods: ["POST", "GET", "OPTIONS"],
  }))
}

app.use(logger());

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
  } as SessionData));

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
    return null
  }

  const sessionData = await env.SESSIONS.get<SessionData>(`session:${sessionCode}`, "json");
  if (sessionData == null) {
    return null;
  }

  if (!identifierRegex.test(sessionData.identifier)) {
    return null
  }

  const query = `
    select exists(
      select 1
      from savedat
      where identifier = ?
    ) as exists_flag
  `.trim();

  const d1result = await c.env.DB.prepare(query).bind(sessionData.identifier).run();
  if (d1result.error) {
    return null;
  }

  if (d1result.results[0] != null) {
    d1result.results[0]
  }

  const exists = (d1result.results?.[0]?.exists_flag ?? 0) === 1;
  return exists ? sessionData : null
}

app.get("/auth", async (c) => {
  // Get the identifier cookie
  const maybeIdentifier = getCookie(c, IDENT_COOKIE_NAME);

  if (maybeIdentifier != null) {
    return (await initSession(c, maybeIdentifier))[0];
  }

  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);

  const identifier = bytes.toBase64();

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
          message: "Must be authenticated to run an action.",
        },
      }),
    );
  }

  const identifier = sessionData.identifier;

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

      // Add the amount paid to the designated user

      const restoreQuery = `
          UPDATE savedat
          SET encoded_save = src.encoded_save,
              nickname     = src.nickname,
              net_worth    = src.net_worth
          FROM (SELECT encoded_save, nickname, net_worth
                FROM savedat
                WHERE identifier = ?1) AS src
          WHERE savedat.identifier = ?2
          RETURNING savedat.identifier,
                    savedat.encoded_save,
                    savedat.nickname,
                    savedat.net_worth;
        `.trim();

      try {
        let res: D1Result<Record<string, unknown>> = await c.env.DB.prepare(
          restoreQuery,
        )
          .bind(oldIdentifier, identifier)
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
