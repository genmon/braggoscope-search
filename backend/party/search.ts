import { clear } from "isbot";
import type * as Party from "partykit/server";

export const SEARCH_SINGLETON_ROOM_ID = "braggoscope";

export default class SearchServer implements Party.Server {
  progress = 0;
  target = 100;
  interval: ReturnType<typeof setInterval> | null = null;

  constructor(public party: Party.Party) {}

  async onMessage(msg: string, connection: Party.Connection) {
    const message = JSON.parse(msg);

    if (message.type === "init") {
      this.interval = setInterval(() => {
        this.progress += 1;
        if (this.progress >= this.target) {
          this.progress = 0;
          clearInterval(this.interval!);
          connection.send(JSON.stringify({ type: "done" }));
        }
        connection.send(
          JSON.stringify({
            type: "progress",
            progress: this.progress,
          })
        );
      }, 50);
    }
  }
}
