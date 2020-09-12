import { serve } from "https://deno.land/std/http/server.ts";
// import { connect } from "https://denopkg.com/keroxp/deno-redis/mod.ts";

const PORT = Deno.env.get("PORT");
const REDIS_URL = Deno.env.get("REDIS_URL");

// const redis = await connect();

const port = typeof PORT === "undefined" ? 3000 : parseInt(PORT, 10);
const server = serve({ port });

console.log(`http://localhost:${port}/`);

for await (const req of server) {
  req.respond({
    body: JSON.stringify(
      {
        REDIS_URL,
        PORT,
      },
      null,
      2
    ),
  });
}
