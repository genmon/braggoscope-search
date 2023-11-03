import { useLoaderData } from "@remix-run/react";
import { useState } from "react";
import type { MetaFunction } from "partymix";
import usePartySocket from "partysocket/react";
import { SEARCH_SINGLETON_ROOM_ID } from "party/search";
import CreateIndexButton from "~/components/create-index-button";
import Search from "~/components/search";

// PartyKit will inject the host into the server bundle
// so let's read it here and expose it to the client
declare const PARTYKIT_HOST: string;
export function loader() {
  return { partykitHost: PARTYKIT_HOST };
}

export const meta: MetaFunction = () => {
  return [
    { title: "Braggoscope search | Admin" },
    { name: "description", content: "Find episodes of BBC In Our Time" },
  ];
};

export default function Admin() {
  const { partykitHost } = useLoaderData<typeof loader>();
  const [isDone, setIsDone] = useState(true);
  const [progress, setProgress] = useState(-1);
  const [target, setTarget] = useState(-1);

  const socket = usePartySocket({
    host: partykitHost,
    party: "search",
    room: SEARCH_SINGLETON_ROOM_ID,
    onMessage: (event) => {
      const message = JSON.parse(event.data);
      if (message.type === "progress") {
        setIsDone(false); // always set this as indexing is a central process
        setProgress(parseInt(message.progress));
        setTarget(parseInt(message.target));
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
      <h1 className="text-3xl font-semibold">Admin</h1>
      <CreateIndexButton
        isDone={isDone}
        progress={progress}
        target={target}
        handleClick={handleClick}
      />
    </div>
  );
}
