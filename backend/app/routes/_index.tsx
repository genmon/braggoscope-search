import { useLoaderData } from "@remix-run/react";
import type { MetaFunction } from "partymix";

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

  return (
    <div className="flex flex-col justify-start items-start w-full gap-6">
      <h1 className="text-3xl font-semibold">Hello, World!</h1>
      <p>Under construction.</p>
    </div>
  );
}
