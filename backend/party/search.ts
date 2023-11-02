import type * as Party from "partykit/server";
import { getEpisodes, upsertEmbedding } from "./utils/indexer";

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
}
