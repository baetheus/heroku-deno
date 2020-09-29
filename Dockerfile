FROM hayd/alpine-deno:1.4.2

EXPOSE $PORT
EXPOSE $REDIS_URL

WORKDIR /app

ADD . .

RUN deno cache -L debug main.ts

CMD ["run", "--allow-env", "--allow-net", "main.ts"]