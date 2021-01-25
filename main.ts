import { serve } from "https://deno.land/std@0.71.0/http/mod.ts";

import { use } from "https://deno.land/x/sedate@v0.0.2/deno_handler.ts";
import * as S from "https://deno.land/x/sedate@v0.0.2/sedate.ts";

import { pipe } from "https://deno.land/x/hkts@v0.0.30/fns.ts";

import { html } from "https://deno.land/x/html/mod.ts";

/**
 * Http Server
 */
const PORT = Deno.env.get("PORT") ?? Deno.exit(1);
const port = parseInt(PORT, 10);

const server = serve({ port });

let count = 0;

/**
 * Template
 */
const page = (count: string | number) => {
  return html`<html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>heroku-deno</title>
    </head>

    <body>
      <h1>Hello, you are person number ${count}</h1>
    </body>
  </html>`;
};

/**
 * Middleware!?!?!
 */
const rootHandler = pipe(
  S.status(S.Status.OK),
  S.ichain(() => S.header("Content-Type", "text/html; charset=UTF-8")),
  S.ichain(() => S.closeHeaders()),
  S.ichain(() => S.send(page(++count))),
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
