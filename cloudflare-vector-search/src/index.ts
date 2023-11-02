/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */
import { Ai } from '@cloudflare/ai';
import { Hono, type Context } from 'hono';
const app = new Hono();

export interface Env {
	AI: Ai;
}

app.get('/', async (c: Context) => {
	const ai = new Ai(c.env.AI);

	const answer = await ai.run('@cf/meta/llama-2-7b-chat-int8', {
		messages: [{ role: 'user', content: `What is the square root of 9?` }],
	});

	return c.json(answer);
});

/*
POST queries the database.

Note: this is filtered to only return vectors for the given guildId,
but the query itself is not scoped to the guildId.
This means that if other guilds have matching threads, they may be returned
first in the query, and this call will not return a full 5 results.
The fix is to wait until Vectorize adds support for filtering on metadata.

It takes a JSON object with properties
- query: string
It returns a list of { id, title, published, permalist, score } objects as
{ matches: {...}[] }

Test in development like:

curl \
-X POST \
--json '{"query": "aristotle"}' \
http://127.0.0.1:8787
*/
app.post('/', async (c: Context) => {
	const ai = new Ai(c.env.AI);

	const { query } = await c.req.json();

	if (!query) {
		return c.json({ error: 'Missing required parameters' }, { status: 400 });
	}

	const { data } = await ai.run('@cf/baai/bge-base-en-v1.5', { text: [query] });
	const values = data[0];

	// Query the database. `returnVectors: true` means we get metadata too
	// This is not scoped to the guildId
	const nearest = await c.env.VECTOR_INDEX.query(values, { topK: 5, returnVectors: true });

	const found: { id: string; title: string; published: string; permalink: string; score: number }[] = [];

	for (const match of nearest.matches) {
		found.push({
			id: match.vector.id,
			...match.vector.metadata,
			score: match.score,
		});
	}

	// Return maximum 5 results
	return c.json({ matches: found.slice(0, 5) });
});

/*
PUT inserts a new embedding into the database for a given guildId and channelId.

It takes a JSON object with properties
- id: string
- title: string
- published: string
- permalink: string
- description: string
It creates an embedding and returns that vector as JSON

Test in development like:

curl \
-X PUT \
--json '{"id": "123", "title": "Hello World", "published": "2023-01-01", "permalink": "TK", "description": "Some words here"}' \
http://127.0.0.1:8787
*/
app.put('/', async (c: Context) => {
	const ai = new Ai(c.env.AI);

	const { id, title, published, permalink, description } = await c.req.json();

	if (!id || !title || !published || !permalink || !description) {
		return c.json({ error: 'Missing required parameters' }, { status: 400 });
	}

	const { data } = await ai.run('@cf/baai/bge-base-en-v1.5', { text: [description] });
	const values = data[0];

	// Upsert the embedding into the database
	// Use an ID to ensure that we only have one embedding for this guildId and channelId
	const upserted = await c.env.VECTOR_INDEX.upsert([{ id, values, metadata: { title, published, permalink } }]);

	return c.json({ ...upserted });
});

export default app;
