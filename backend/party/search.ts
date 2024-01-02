import type * as Party from "partykit/server";
import { Ai } from "partykit-ai";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST",
  "Access-Control-Allow-Headers":
    "Origin, X-Requested-With, Content-Type, Accept",
};

export const SEARCH_SINGLETON_ROOM_ID = "braggoscope";

export async function getEpisodes() {
  return await fetch("https://www.braggoscope.com/episodes.json").then((res) =>
    res.json()
  );
}

export default class SearchServer implements Party.Server {
  ai: Ai;

  constructor(public party: Party.Room) {
    this.ai = new Ai(party.ai);
  }

  async onMessage(msg: string, connection: Party.Connection) {
    const message = JSON.parse(msg);

    if (message.type === "init") {
      // As a minimal password system, only permit messages that include an adminKey
      // that matches a secret in the environment.
      if (message.adminKey !== this.party.env.BRAGGOSCOPE_SEARCH_ADMIN_KEY)
        return;
      await this.buildIndex();
    }
  }

  broadcastProgress(current: number, target: number) {
    this.party.broadcast(
      JSON.stringify({
        type: "progress",
        target: target,
        progress: current,
      })
    );
  }

  async buildIndex() {
    const episodes = await getEpisodes();
    this.broadcastProgress(0, episodes.length);

    const PAGE_SIZE = 20;

    for (let i = 0; i < episodes.length; i += PAGE_SIZE) {
      const page = episodes.slice(i, i + PAGE_SIZE);
      await this.upsert(page);
      this.broadcastProgress(i, episodes.length);
    }

    this.party.broadcast(
      JSON.stringify({
        type: "done",
      })
    );
  }

  async onRequest(req: Party.Request) {
    if (this.party.id !== SEARCH_SINGLETON_ROOM_ID) {
      return new Response("Not Found", { status: 404 });
    }

    if (req.method === "POST") {
      const { query } = (await req.json()) as any;
      const episodes = await this.search(query);
      return Response.json({ episodes }, { status: 200, headers: CORS });
    }

    // respond to cors preflight requests
    if (req.method === "OPTIONS") {
      return Response.json({ ok: true }, { status: 200, headers: CORS });
    }

    return new Response("Method Not Allowed", { status: 405 });
  }

  async upsert(episodes: any[]) {
    // Get embeddings for episodes
    const { data } = await this.ai.run("@cf/baai/bge-base-en-v1.5", {
      text: episodes.map((episode: any) => episode.description),
    });
    console.log("got embeddings", data);

    // Vectorize uses vector objects. Combine the episodes list with the embeddings
    const vectors = episodes.map((episode: any, i: number) => ({
      id: episode.id,
      values: data[i],
      metadata: {
        title: episode.title,
        published: episode.published,
        permalink: episode.permalink,
      },
    }));

    // Upsert the embeddings into the database
    const result = await this.party.context.vectorize.searchIndex.upsert(
      vectors
    );
    console.log("upserted", result);
  }

  async search(query: string) {
    // Get the embedding for the query
    const { data } = await this.ai.run("@cf/baai/bge-base-en-v1.5", {
      text: [query],
    });

    const queryVector = data[0];

    // Search the index for the query vector
    const nearest = await this.party.context.vectorize.searchIndex.query(
      queryVector,
      {
        topK: 15,
        returnValues: false,
        returnMetadata: true,
      }
    );

    console.log("nearest", nearest);

    const found: {
      id: string;
      title?: string;
      published?: string;
      permalink?: string;
      score: number;
    }[] = [];

    for (const match of nearest.matches) {
      found.push({
        id: match.vectorId,
        ...match.vector.metadata,
        score: match.score,
      });
    }

    // Return maximum 15 results
    return found.slice(0, 15);
  }
}
