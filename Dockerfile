FROM hayd/alpine-deno:1.5.0

WORKDIR /app

ADD . .

RUN deno cache main.ts

CMD ["run", "--allow-env", "--allow-net", "main.ts"]