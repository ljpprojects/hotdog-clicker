import { Hono, Context } from "hono";
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

const IDENT_COOKIE_NAME = "identifier";
const IDENT_COOKIE_MAX_AGE = 60 ** 2 * 24 * 31 * 6;

const COOKIE_OPTS: (age: number) => CookieOptions = (age: number) => ({
  httpOnly: true,
  sameSite: "Strict",
  maxAge: age,
  secure: true,
  prefix: "secure",
  path: "/",
  // domain: "hdc.ljpprojects.org"
});

const sanitiseDBData = (full: DBDataFull): DBData => {
  return {
    encoded_save: full.encoded_save,
    nickname: full.nickname,
    net_worth: full.net_worth
  } satisfies DBData;
};

type Bindings = {
  DB: D1Database;
};

const workerData: (dat: ServerSentWorkerData) => ServerSentWorkerData = (dat) =>
  dat;

const app = new Hono<{ Bindings: Bindings }>();

app.use(trimTrailingSlash());

app.use(csrf({
  origin: [
    'https://hdc.ljpprojects.org',
    'https://dev.hdc.ljpprojects.org',
  ],
}))

app.use(cors({
  origin: [
    'https://hdc.ljpprojects.org',
    'https://dev.hdc.ljpprojects.org',
  ],
  allowHeaders: ['X-Custom-Header', 'Upgrade-Insecure-Requests'],
  allowMethods: ['POST', 'GET'],
  exposeHeaders: ['Content-Length', 'X-Kuma-Revision'],
  maxAge: 600,
  credentials: true,
}))

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
      workerData({
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
      workerData({
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
