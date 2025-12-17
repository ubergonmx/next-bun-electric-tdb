Using Next.js + Bun + Tanstack DB + Electric SQL

I'm using this repository to experiment with tanstack db and electric sql in Next. Also, find weird interactions and bugs.

## How to run

1. `bun i`
2. `docker compose up` and rename .example.env to .env
3. `bun db:migrate`
4. `bun dev` or `bun run --bun next dev` to run in bun or do `bun run next dev` to run in node


## Some issues i ran into:

1. ~~Using `syncMode: "on-demand"` is not properly working~~ 

Solution:
It does work but the setup must be with query:
```ts
✅
const { data: messages, isLoading } = useLiveQuery(
  q => q.from({cm:chatMessagesCollection})
);
```
not with: 
```ts
❌
const { data: messages, isLoading } = useLiveQuery(chatMessagesCollection)
```
2. Using ngrok with bun runtime doesnt work well, but works fine with node runtime

Try it out:
- `bun run --bun next dev` to run in bun environment
- `bun run next dev` to run in node environment
then do `ngrok http 3000` 

## What i did starting from nothing:

1. Create next app via bun
```bash
bunx create-next-app@latest
✔ What is your project named? … next-bun-electric-tdb
✔ Would you like to use the recommended Next.js defaults? › Yes, use recommended defaults
```

2. Install packages
```bash
bun i drizzle-orm drizzle-kit drizzle-zod postgres @tanstack/react-db @tanstack/electric-db-collection @electric-sql/client 
```

3. Setup db, check:
- [compose.yml](./compose.yml) (postgres + electric sql)
- .example.env 
- [db/index.ts](./lib/db/index.ts) - db setup + txid function
- [db/schema.ts](./lib/db/schema.ts) - 1 table (chatMessages)
- added packagage.json scripts for drizzle

4. Setup tanstack db collection, actions, API and UI components:
- [electric sql API](/app/api/messages/route.ts) - GET request
- [lib/actions.ts](./lib/actions.ts) - create,update,delete chat messages
- [lib/collections.ts](./lib/collections.ts) - tanstackdb collection w/ electricsql
- [components/client-only.tsx](./components/client-only.tsx) - wrapped children in layout for tanstack db
- [components/chat](./components/chat) - the chat component

5. Modify package.json scripts to force run bun:
```json
"scripts": {
  "dev": "bun run --bun next dev",
  "build": "bun run --bun next build",
  "start": "bun run --bun next start",
},
```

6. Now we can run `bun dev` in bun environment`