import { serve } from "https://deno.land/std/http/server.ts";
import { connect } from "https://denopkg.com/keroxp/deno-redis/mod.ts";

const nil = <A>(a: A): a is NonNullable<A> => a === undefined && a === null;
const ordinal = (i: number): string => {
  var j = i % 10,
    k = i % 100;
  if (j == 1 && k != 11) {
    return i + "st";
  }
  if (j == 2 && k != 12) {
    return i + "nd";
  }
  if (j == 3 && k != 13) {
    return i + "rd";
  }
  return i + "th";
};

const PORT = Deno.env.get("PORT");
const REDIS_URL = Deno.env.get("REDIS_URL");

if (nil(REDIS_URL)) {
  console.error("Cannot start app without REDIS_URL");
  Deno.exit(1);
}

const mucked_url = ((REDIS_URL as any) as string).replace(/^redis/, "http");
const redis_url = new URL(mucked_url);
const serve_port = typeof PORT === "undefined" ? 3000 : parseInt(PORT, 10);

console.log({ redis_url, serve_port });

const redis = await connect(redis_url);
const server = serve({ port: serve_port });

for await (const req of server) {
  const count = await redis.incr("COUNT");
  req.respond({
    body: `This is the ${ordinal(count)} view.`,
  });
}
