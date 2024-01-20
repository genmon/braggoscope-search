import { useLoaderData } from "@remix-run/react";
import { useState } from "react";
import type { LoaderFunctionArgs, MetaFunction } from "partymix";
import usePartySocket from "partysocket/react";
import CreateIndexButton from "~/components/create-index-button";
import { SEARCH_PARTY_NAME, SEARCH_SINGLETON_ROOM_ID } from "~/utils";

export function loader({ request }: LoaderFunctionArgs) {
  // parse the search params for `?q=`
  const url = new URL(request.url);
  const adminKey = url.searchParams.get("key");

  return { adminKey };
}

export const meta: MetaFunction = () => {
  return [
    { title: "Braggoscope search | Admin" },
    { name: "description", content: "Find episodes of BBC In Our Time" },
  ];
};

export default function Admin() {
  const { adminKey } = useLoaderData<typeof loader>();
  const [isDone, setIsDone] = useState(true);
  const [progress, setProgress] = useState(-1);
  const [target, setTarget] = useState(-1);
  const [error, setError] = useState<string | null>(null);

  const socket = usePartySocket({
    host: window.location.host,
    party: SEARCH_PARTY_NAME,
    room: SEARCH_SINGLETON_ROOM_ID,
    onMessage: (event) => {
      const message = JSON.parse(event.data);
      if (message.type === "progress") {
        setIsDone(false); // always set this as indexing is a central process
        setProgress(parseInt(message.progress));
        setTarget(parseInt(message.target));
      } else if (message.type === "done") {
        setIsDone(true);
      } else if (message.type === "error") {
        setError(message.error);
      }
    },
  });

  const handleClick = () => {
    socket.send(JSON.stringify({ type: "init", adminKey: adminKey }));
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
      <p>
        To start building the index, ensure that <code>?key=XXX</code> is in the
        URL and the key matches the enviroment variable{" "}
        <code>BRAGGOSCOPE_SEARCH_ADMIN_KEY</code>.
      </p>
      {error && <p className="text-red-500">Error: {JSON.stringify(error)}</p>}
    </div>
  );
}
