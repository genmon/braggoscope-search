import { useState } from "react";
import SearchInput from "./search-input";
import SearchResults from "./search-results";

export default function Search(props: {
  partykitHost: string;
  party: string;
  room: string;
}) {
  const [query, setQuery] = useState("");

  const handleSearch = (query: string) => {
    setQuery(query);
  };

  return (
    <div className="flex flex-col justify-start items-start gap-6 w-full">
      <SearchInput handleSearch={handleSearch} />
      {query && (
        <SearchResults
          partykitHost={props.partykitHost}
          party={props.party}
          room={props.room}
          query={query}
        />
      )}
      <code className="font-mono text-xs text-gray-400">
        Host: {props.partykitHost}
      </code>
    </div>
  );
}
