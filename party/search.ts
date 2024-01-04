import type * as Party from "partykit/server";
import { Ai } from "partykit-ai";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST",
  "Access-Control-Allow-Headers":
    "Origin, X-Requested-With, Content-Type, Accept",
};

export const SEARCH_SINGLETON_ROOM_ID = "api";

type Episode = {
  id: string;
  title: string;
  published: string;
  permalink: string;
  description: string;
};

type Found = Omit<Episode, "description"> & { score: number };

export async function getEpisodes(): Promise<Episode[]> {
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
      // Minimal security! Only allow the admin key to trigger a rebuild
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
      await this.index(episodes.slice(i, i + PAGE_SIZE));
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
      const found = await this.search(query);
      return Response.json({ episodes: found }, { status: 200, headers: CORS });
    }

    // respond to cors preflight requests
    if (req.method === "OPTIONS") {
      return Response.json({ ok: true }, { status: 200, headers: CORS });
    }

    return new Response("Method Not Allowed", { status: 405 });
  }

  async index(episodes: Episode[]) {
    // Get embeddings for episodes
    const { data: embeddings } = await this.ai.run(
      "@cf/baai/bge-base-en-v1.5",
      {
        text: episodes.map((episode) => episode.description),
      }
    );

    // Vectorize uses vector objects. Combine the episodes list with the embeddings
    const vectors = episodes.map((episode, i) => ({
      id: episode.id,
      values: embeddings[i],
      metadata: {
        title: episode.title,
        published: episode.published,
        permalink: episode.permalink,
      },
    }));

    // Upsert the embeddings into the database
    await this.party.context.vectorize.searchIndex.upsert(vectors);
  }

  async search(query: string) {
    // Get the embedding for the query
    const { data: embeddings } = await this.ai.run(
      "@cf/baai/bge-base-en-v1.5",
      {
        text: [query],
      }
    );

    // Search the index for the query vector
    const nearest: any = await this.party.context.vectorize.searchIndex.query(
      embeddings[0],
      {
        topK: 15,
        returnValues: false,
        returnMetadata: true,
      }
    );

    // Convert to a form useful to the client
    const found: Found[] = nearest.matches.map((match: any) => ({
      id: match.vectorId,
      ...match.vector.metadata,
      score: match.score,
    }));

    return found;
  }
}
