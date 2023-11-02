# braggoscope-search

## cloudflare-vector-search

Implements adding vectors to and querying the vector search index.

This runs as a Cloudflare Worker, independently of the PartyKit backend.

### Setup

This is a tutorial about creating and using the database: https://developers.cloudflare.com/workers-ai/tutorials/build-a-retrieval-augmented-generation-ai/

The setup process:

- `npm create cloudflare@latest` with the project name `cloudflare-vector-search`
- `cd cloudflare-vector-search` then `npx wrangler dev --remote` to develop locally
- Install `@cloudflare/ai` and add the bindings to `wrangler.toml` as in the tutorial
- Deploy and upgrade to a paid plan (Vectorize is currently only available on a Workers Paid plan)
- `wrangler vectorize create braggoscope-index --dimensions=768 --metric=cosine`
- `npm install hono` -- a routing library for Cloudflare workers
- Now it's possible to write `src/index.ts`
- Deploy with `npx wrangler deploy`
- Add the deploy URL as an environment variable in `.env` as `CLOUDFLARE_VECTORIZE_URL`
