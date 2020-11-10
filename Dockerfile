FROM hayd/alpine-deno:1.5.0

EXPOSE $PORT
EXPOSE $REDIS_URL

WORKDIR /app

ADD . .

RUN deno cache main.ts

CMD ["run", "--allow-env", "--allow-net", "main.ts"]