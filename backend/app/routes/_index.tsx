import { useLoaderData } from "@remix-run/react";
import { useState } from "react";
import type { MetaFunction } from "partymix";
import usePartySocket from "partysocket/react";
import { SEARCH_SINGLETON_ROOM_ID } from "party/search";

// PartyKit will inject the host into the server bundle
// so let's read it here and expose it to the client
declare const PARTYKIT_HOST: string;
export function loader() {
  return { partykitHost: PARTYKIT_HOST };
}

export const meta: MetaFunction = () => {
  return [
    { title: "A new search tool" },
    { name: "description", content: "Vectorize-based search" },
  ];
};

export default function Index() {
  const { partykitHost } = useLoaderData<typeof loader>();
  const [isDone, setIsDone] = useState(true);
  const [progress, setProgress] = useState(0);

  const socket = usePartySocket({
    host: partykitHost,
    party: "search",
    room: SEARCH_SINGLETON_ROOM_ID,
    onMessage: (event) => {
      const message = JSON.parse(event.data);
      if (message.type === "progress") {
        setProgress(message.progress);
      } else if (message.type === "done") {
        setIsDone(true);
      }
    },
  });

  const handleClick = () => {
    socket.send(JSON.stringify({ type: "init" }));
    setIsDone(false);
  };

  return (
    <div className="flex flex-col justify-start items-start w-full gap-6">
      <h1 className="text-3xl font-semibold">Hello, World!</h1>
      <button
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        onClick={handleClick}
        disabled={!isDone}
      >
        {isDone ? "Init" : "Working..."}
      </button>
      {!isDone && <progress className="w-1/2" value={progress} max="100" />}
    </div>
  );
}
