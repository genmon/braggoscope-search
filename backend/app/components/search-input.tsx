import { useState } from "react";

export default function SearchInput(props: {
  handleSearch: (query: string) => void;
}) {
  const [query, setQuery] = useState("");

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    props.handleSearch(query);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex justify-start items-center gap-2"
    >
      <input
        className="border border-gray-300 rounded-sm px-2 py-2"
        type="text"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
      />
      <button
        className="border border-blue-500 hover:bg-blue-100 text-blue-500 hover:text-blue-700 font-semibold py-2 px-4 rounded-sm"
        type="submit"
      >
        Search
      </button>
    </form>
  );
}
