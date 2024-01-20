import { Suspense, useState } from "react";
import SearchInput from "./search-input";
import SearchResults from "./search-results";

export default function Search(props: { party: string; room: string }) {
  const [query, setQuery] = useState("");

  return (
    <div className="flex flex-col justify-start items-start gap-6 w-full">
      <SearchInput onQuery={setQuery} />
      <Suspense fallback={<div>Loading...</div>}>
        {query && (
          <SearchResults party={props.party} room={props.room} query={query} />
        )}
      </Suspense>
    </div>
  );
}
