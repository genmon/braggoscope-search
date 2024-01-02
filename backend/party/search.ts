import type * as Party from "partykit/server";
import {
  getEpisodes,
  upsertEmbedding,
  searchEmbeddings,
  batchUpsert,
  search,
} from "./utils/indexer";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST",
  "Access-Control-Allow-Headers":
    "Origin, X-Requested-With, Content-Type, Accept",
};

export const SEARCH_SINGLETON_ROOM_ID = "braggoscope";

export default class SearchServer implements Party.Server {
  progress = 0;
  target = 100;
  interval: ReturnType<typeof setInterval> | null = null;

  constructor(public party: Party.Party) {}

  async onMessage(msg: string, connection: Party.Connection) {
    const message = JSON.parse(msg);

    if (message.type === "init") {
      // As a minimal password system, only permit messages that include an adminKey
      // that matches a secret in the environment.
      if (message.adminKey !== this.party.env.BRAGGOSCOPE_SEARCH_ADMIN_KEY)
        return;
      //await this.buildIndex();
      await this.batchBuildIndex();
    }
  }

  broadcastProgress() {
    console.log("broadcasting progress", this.progress, this.target);
    this.party.broadcast(
      JSON.stringify({
        type: "progress",
        target: this.target,
        progress: this.progress,
      })
    );
  }

  async buildIndex() {
    const episodes = await getEpisodes();
    this.target = episodes.length;
    this.progress = 0;
    this.broadcastProgress();

    for (const episode of episodes) {
      //const { id, title, published, permalink, description } = episode;
      await upsertEmbedding({ ...episode, env: this.party.env });
      this.progress += 1;
      this.broadcastProgress();
    }

    this.party.broadcast(
      JSON.stringify({
        type: "done",
      })
    );
  }

  async batchBuildIndex() {
    const episodes = await getEpisodes();
    this.target = episodes.length;
    this.progress = 0;
    this.broadcastProgress();

    // Page through episodes
    const PAGE_SIZE = 1;
    const pages = Math.ceil(episodes.length / PAGE_SIZE);
    for (let i = 0; i < pages; i++) {
      const page = episodes.slice(i * PAGE_SIZE, (i + 1) * PAGE_SIZE);
      await batchUpsert({
        env: this.party.env,
        episodes: page,
        searchIndex: this.party.context.vectorize.searchIndex,
      });
      this.progress += PAGE_SIZE;
      this.broadcastProgress();
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
      const episodes = await search({
        env: this.party.env,
        query,
        searchIndex: this.party.context.vectorize.searchIndex,
      });
      const dummyEpisodes = [
        {
          id: "123",
          title: "Title: " + query,
          published: "2023-01-01",
          permalink: "TK",
          score: 0.5,
        },
      ];
      return Response.json({ episodes }, { status: 200, headers: CORS });
    }

    // respond to cors preflight requests
    if (req.method === "OPTIONS") {
      return Response.json({ ok: true }, { status: 200, headers: CORS });
    }

    return new Response("Method Not Allowed", { status: 405 });
  }
}
