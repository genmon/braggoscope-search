import type { MetaFunction } from "partymix";
import Search from "~/components/search";
import { SEARCH_PARTY_NAME, SEARCH_SINGLETON_ROOM_ID } from "~/utils";

export const meta: MetaFunction = () => {
  return [
    { title: "Braggoscope search" },
    { name: "description", content: "Find episodes of BBC In Our Time" },
  ];
};

export default function Index() {
  return (
    <div className="mx-auto flex flex-col justify-start items-start gap-6 w-full max-w-md">
      <h1 className="text-3xl font-semibold">Braggoscope search</h1>
      <Search party={SEARCH_PARTY_NAME} room={SEARCH_SINGLETON_ROOM_ID} />
    </div>
  );
}
