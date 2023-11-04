import { useLoaderData } from "@remix-run/react";
import type { MetaFunction } from "partymix";
import { SEARCH_SINGLETON_ROOM_ID } from "party/search";
import Search from "~/components/search";

// PartyKit will inject the host into the server bundle
// so let's read it here and expose it to the client
declare const PARTYKIT_HOST: string;
export function loader() {
  return { partykitHost: PARTYKIT_HOST };
}

export const meta: MetaFunction = () => {
  return [
    { title: "Braggoscope search" },
    { name: "description", content: "Find episodes of BBC In Our Time" },
  ];
};

export default function Index() {
  const { partykitHost } = useLoaderData<typeof loader>();

  return (
    <div className="mx-auto flex flex-col justify-start items-start gap-6 w-full max-w-md">
      <h1 className="text-3xl font-semibold">Braggoscope search</h1>
      <Search
        partykitHost={partykitHost}
        party="search"
        room={SEARCH_SINGLETON_ROOM_ID}
      />
    </div>
  );
}
