import { serve } from "https://deno.land/std/http/server.ts";

const PORT = Deno.env.get("PORT");
const port = typeof PORT === "undefined" ? 3000 : parseInt(PORT, 10);
const server = serve({ port });

console.log(`http://localhost:${port}/`);

for await (const req of server) {
  req.respond({ body: "Hello World\n" });
}
