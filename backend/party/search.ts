import type * as Party from "partykit/server";
import {
  getEpisodes,
  upsertEmbedding,
  searchEmbeddings,
} from "./utils/indexer";

export const SEARCH_SINGLETON_ROOM_ID = "braggoscope";

export default class SearchServer implements Party.Server {
  progress = 0;
  target = 100;
  interval: ReturnType<typeof setInterval> | null = null;

  constructor(public party: Party.Party) {}

  async onMessage(msg: string, connection: Party.Connection) {
    const message = JSON.parse(msg);

    if (message.type === "init") {
      await this.buildIndex();
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

  async onRequest(req: Party.Request) {
    if (this.party.id !== SEARCH_SINGLETON_ROOM_ID) {
      return new Response("Not Found", { status: 404 });
    }

    if (req.method === "POST") {
      const { query } = (await req.json()) as any;
      const episodes = await searchEmbeddings({ env: this.party.env, query });
      const dummyEpisodes = [
        {
          id: "123",
          title: "Title: " + query,
          published: "2023-01-01",
          permalink: "TK",
          score: 0.5,
        },
      ];
      return new Response(JSON.stringify({ episodes }));
    }

    return new Response("Method Not Allowed", { status: 405 });
  }
}
