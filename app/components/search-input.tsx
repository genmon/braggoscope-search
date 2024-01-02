import { useState } from "react";

export default function SearchInput(props: {
  handleSearch: (query: string) => void;
}) {
  const [query, setQuery] = useState("");

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // blur the form
    event.currentTarget.querySelector("input")?.blur();
    props.handleSearch(query);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full flex justify-start items-center gap-2"
    >
      <input
        className="grow border border-gray-300 rounded-sm px-2 py-2 w-full"
        type="text"
        value={query}
        placeholder="e.g. greek myths"
        onChange={(event) => setQuery(event.target.value)}
      />
      <button
        className="grow-0 border border-blue-500 hover:bg-blue-100 text-blue-500 hover:text-blue-700 font-semibold py-2 px-4 rounded-sm"
        type="submit"
      >
        Search
      </button>
    </form>
  );
}
