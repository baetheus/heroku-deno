import { serve } from "https://deno.land/std/http/server.ts";
import { connect } from "https://deno.land/x/redis@v0.13.0/mod.ts";
import { use } from "https://deno.land/x/sedate@v0.0.2/deno_handler.ts";
import * as S from "https://deno.land/x/sedate@v0.0.2/sedate.ts";
import { pipe } from "https://deno.land/x/hkts@v0.0.15/fns.ts";

const nil = <A>(a: A): a is NonNullable<A> => a === undefined && a === null;

const PORT = Deno.env.get("PORT");
const REDIS_URL = Deno.env.get("REDIS_URL");

if (nil(REDIS_URL)) {
  console.error("Cannot start app without REDIS_URL");
  Deno.exit(1);
}

const mucked_url = ((REDIS_URL as any) as string).replace(/^redis/, "http");
const { hostname, port, username, password } = new URL(mucked_url);
const serve_port = typeof PORT === "undefined" ? 3000 : parseInt(PORT, 10);

console.log({ redis: { hostname, port, username, password }, serve_port });

const redis = await connect({ hostname, port });

await redis.auth("asdf");

const server = serve({ port: serve_port });

/**
 * Middleware!?!?!
 */
const rootHandler = pipe(
  S.status(S.Status.OK),
  S.ichain(() => S.closeHeaders()),
  S.ichain(() =>
    S.tryCatch(
      () => redis.incr("COUNT"),
      () => "Unable to access REDIS"
    )
  ),
  S.ichain((count) => S.send(`Hello, you are person number ${count}.`)),
  S.orElse(S.send)
);

for await (const req of server) {
  if (req.url === "/") {
    await use(rootHandler)(req);
  } else {
    req.respond({ status: 404 });
  }
}
