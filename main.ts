import { serve } from "https://deno.land/std@0.71.0/http/mod.ts";
import { connect } from "https://deno.land/x/redis@v0.13.0/mod.ts";

import { use } from "https://deno.land/x/sedate@v0.0.2/deno_handler.ts";
import * as S from "https://deno.land/x/sedate@v0.0.2/sedate.ts";

import { pipe } from "https://deno.land/x/hkts@v0.0.30/fns.ts";
import * as D from 'https://deno.land/x/hkts@v0.0.30/decoder.ts';
import * as E from 'https://deno.land/x/hkts@v0.0.30/either.ts';

import { html } from 'https://deno.land/x/html/mod.ts';

/**
 * Environmental Settings Decoder
 */
const Settings = D.type({
  PORT: D.string,
  REDIS_URL: D.string,
});

/**
 * Parsed Environmental Settings
 */
const { REDIS_URL, PORT } = pipe(
  Settings.decode(Deno.env.toObject()),
  E.getOrElse(() => ({ PORT: "5000", REDIS_URL: "redis://localhost:6379"}))
);

const redis_url = new URL(REDIS_URL.replace(/^redis/, "http"));
const serve_port = typeof PORT === "undefined" ? 3000 : parseInt(PORT, 10);

/**
 * Redis Connection
 */
const redis = await connect({ hostname: redis_url.hostname, port: redis_url.port });
await redis.auth(redis_url.password);

/**
 * Http Server
 */
const server = serve({ port: serve_port });

/**
 * Template
 */
const page = (body: string) => html`<html>

<head>
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>heroku-deno</title>
</head>

<body>${body}</body>

</html>`;

/**
 * Middleware!?!?!
 */
const rootHandler = pipe(
  S.status(S.Status.OK),
  S.ichain(() => S.closeHeaders()),
  S.ichain(() => S.rightTask(() => redis.incr("COUNT"))),
  S.ichain((count) => S.send(page(html`<h1>Hello, you are person number ${count}.</h1>`))),
  S.orElse(S.send)
);

/**
 * Handle Requests
 */
for await (const req of server) {
  if (req.url === "/") {
    await use(rootHandler)(req);
  } else {
    req.respond({ status: 404 });
  }
}
